# Node-RED Nextcloud talk

[![license: LGPLv3](https://img.shields.io/badge/license-LGPL--3.0--or--later-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)
[![GitHub release](https://img.shields.io/github/release/nioc/node-red-contrib-nextcloud-talk.svg)](https://github.com/nioc/node-red-contrib-nextcloud-talk/releases/latest)
[![GitHub Lint Workflow Status](https://img.shields.io/github/actions/workflow/status/nioc/node-red-contrib-nextcloud-talk/commit.yml?label=lint)](https://github.com/nioc/node-red-contrib-nextcloud-talk/actions/workflows/commit.yml)
[![GitHub Publish Workflow Status](https://img.shields.io/github/actions/workflow/status/nioc/node-red-contrib-nextcloud-talk/publish.yml?label=publish)](https://github.com/nioc/node-red-contrib-nextcloud-talk/actions/workflows/publish.yml)
[![npm](https://img.shields.io/npm/dt/node-red-contrib-nextcloud-talk)](https://www.npmjs.com/package/node-red-contrib-nextcloud-talk)

Nextcloud Talk connector for Node-RED without any third-party dependencies

## Key features

- Send message to room as bot,
- Listen for messages in room.

## Installation

Search `node-red-contrib-nextcloud-talk` within the palette manager or install with npm from the command-line (within your user data directory):

```bash
npm install node-red-contrib-nextcloud-talk
```

As with every [node installation](https://nodered.org/docs/user-guide/runtime/adding-nodes), you may need to restart Node-RED for it to pick-up the new nodes.

## Configuration

### Nextcloud Talk

Install a bot by providing the following three pieces of information (see [docs](https://nextcloud-talk.readthedocs.io/en/latest/occ/#talkbotinstall)):

- bot name,
- secret (between 40 et 128 characters),
- full URL of your Node-RED instance (including the access path)

```bash
occ talk:bot:install mybotname mySup3rSecret https://node-red-instance.domain.ltd:1880/talk
```

### Node-RED

> [!IMPORTANT]  
> In order to verify the message signature, you will need to modify the `httpAdminRoot` attribute in the `setting.js` file so that it is not at the root.

```js
{
    // uncomment to ensure that admin does not use "/"
    httpAdminRoot: '/admin',
}
```

Configure your node with the shared secret, nextcloud URL.

## Versioning

node-red-contrib-nextcloud-talk is maintained under the [semantic versioning](https://semver.org/) guidelines.

See the [releases](https://github.com/nioc/node-red-contrib-nextcloud-talk/releases) on this repository for changelog.

## Contributors

- **[Nioc](https://github.com/nioc/)** - _Initial work_

See also the full list of [contributors](https://github.com/nioc/node-red-contrib-nextcloud-talk/graphs/contributors) to this project.

## License

This project is licensed under the GNU Lesser General Public License v3.0 - see the [LICENSE](LICENSE.md) file for details
