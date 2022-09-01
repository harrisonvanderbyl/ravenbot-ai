# this is writerbot, a bot for use in ai stuff

### Example/Discord/Help

You can test and use the current version [here](https://discord.gg/eZqw6gMhf6)

## Installation

It's just a Node bot using [Discord.js](https://discord.js.org/), recently updated to its v9 API, with slash commands. Its installation process is simple, download and install its dependencies.

```bash
yarn install
```

## Config File
place in ./config/config.json

```json
{
    "token": "xxx", // Discord bot token
    "apikey": "sk-xxx", // gpt3 api key
    "adminChannel" : "xxx" // Channel ID of debug/admin channel
}
```

## Usage

```bash
ts-node ./index.ts
```

## to deploy/delete/view application commands, 
use

```bash
ts-node ./commands/createSlashCommands.ts
```

For local debugging, set offline.json to true, and set the admin channel id in the code.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

### Roadmap
add stability.ai and other models.

### Support
[Patreon](https://www.patreon.com/Unexplored_Horizons)

## License
[MIT](https://choosealicense.com/licenses/mit/)
