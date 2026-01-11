const crypto = require('crypto')
const version = require('../package.json').version

module.exports = function (RED) {
  'use strict'

  function verifySignature (secret, signature, random, body) {
    const expected = Buffer.from(signature, 'hex')
    const digest = Buffer.from(crypto
      .createHmac('sha256', secret)
      .update(random + body)
      .digest('hex'), 'hex')
    return expected.length === digest.length && crypto.timingSafeEqual(expected, digest)
  }

  function NextCloudTalkBotNode (config) {
    RED.nodes.createNode(this, config)
    this.endpoint = config.endpoint
  }

  function NextCloudTalkSendNode (config) {
    RED.nodes.createNode(this, config)
    this.status({})
    const node = this
    const bot = RED.nodes.getNode(config.bot)
    const endpoint = bot ? bot.endpoint : null
    const secret = bot && bot.credentials ? bot.credentials.secret : null
    const { message: configMessage, token: configToken } = config
    if (!endpoint || !secret) {
      this.error('Invalid configuration')
      this.status({ fill: 'red', shape: 'ring', text: 'invalid configuration' })
      return
    }
    this.on('input', async function (msg, send, done) {
      node.status({ fill: 'blue', shape: 'dot', text: 'sending' })
      try {
        let message = configMessage
        let token = configToken
        if (msg.message) {
          message = msg.message
        }
        if (msg.token) {
          token = msg.token
        }
        if (!message) {
          throw new Error('Missing message')
        }
        if (!token) {
          throw new Error('Missing token')
        }
        const random = crypto.randomBytes(32).toString('hex')
        const signature = crypto
          .createHmac('sha256', secret)
          .update(random + message)
          .digest('hex')
        const url = `${endpoint}/ocs/v2.php/apps/spreed/api/v1/bot/${token}/message`
        const options = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'OCS-APIRequest': true,
            'X-Nextcloud-Talk-Bot-Random': random,
            'X-Nextcloud-Talk-Bot-Signature': signature,
            'User-Agent': `NodeRedNextcloudTalk/${version}`,
          },
          body: JSON.stringify({ message }),
        }
        const response = await fetch(url, options)
        if (!response.ok) {
          try {
            msg.payload = await response.json()
          } catch (error) {
            msg.payload = {}
          }
          throw new Error(`Request error (${(response.statusText)})`)
        }
        msg.payload = await response.json()
        node.status({})
        send([msg, null])
      } catch (err) {
        node.status({ fill: 'red', shape: 'dot', text: err.message ? err.message : err.toString() })
        msg.error = err
        send([null, msg])
      }
      done()
    })
  }

  function NextCloudTalkWebhookNode (config) {
    RED.nodes.createNode(this, config)
    this.status({})
    const node = this
    const { url, verify } = config
    const bot = RED.nodes.getNode(config.bot)
    const secret = bot && bot.credentials ? bot.credentials.secret : null
    if (!secret || !url) {
      this.error('Invalid configuration')
      this.status({ fill: 'red', shape: 'ring', text: 'invalid configuration' })
      return
    }
    const rawBodyParser = function (req, res, next) {
      req.body = ''
      req._body = true
      const data = []
      req.on('data', chunk => data.push(chunk))
      req.on('end', () => {
        const rawBody = Buffer.concat(data).toString()
        req.rawBody = rawBody
        try {
          req.body = JSON.parse(rawBody)
        } catch (error) {
          req.body = rawBody
        }
        next()
      })
    }
    RED.httpNode.post(url, rawBodyParser, (req, res) => {
      try {
        const random = req.headers['x-nextcloud-talk-random']
        const signature = req.headers['x-nextcloud-talk-signature']
        const msg = {
          _msgid: RED.util.generateId(),
          req,
        }
        if (verify) {
          if (!random || !signature) {
            res.sendStatus(400)
            msg.error = 'signature headers are missing'
            node.send([null, msg])
            return
          }
          if (!verifySignature(secret, signature, random, req.rawBody)) {
            res.sendStatus(400)
            msg.error = 'invalid signature'
            node.send([null, msg])
            return
          }
        }
        // success
        msg.payload = req.body
        res.sendStatus(200)
        node.send([msg, null])
      } catch (error) {
        msg.error = error
        res.sendStatus(500)
        node.send([null, msg])
      }
    })
    this.on('close', function () {
      RED.httpNode._router.stack.forEach(function (route, i, routes) {
        if (route.route && route.route.path === url && route.route.methods.post) {
          routes.splice(i, 1)
        }
      })
    })
  }

  RED.nodes.registerType('nextcloud-talk-bot', NextCloudTalkBotNode, {
    credentials: {
      secret: {
        type: 'password',
      },
    },
  })
  RED.nodes.registerType('nextcloud-talk-send', NextCloudTalkSendNode)
  RED.nodes.registerType('nextcloud-talk-webhook', NextCloudTalkWebhookNode)
}
