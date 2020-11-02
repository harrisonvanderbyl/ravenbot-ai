# RavenBot

RavenBot is a Discord Bot designed to help the users and author of the [Alexander Wales](http://alexanderwales.com/) server, with features related to his story Worth the Candle.

## Installation

It's just a Node bot using [Discord.js](https://discord.js.org/). Its installation process is simple, download and install its dependencies.

```bash
npm install
```

## Usage
I run this using [PM2](https://pm2.keymetrics.io), which watches the file for changes and restarts it if it crashes. The process I use for debugging is something like the following.

```bash
pm2 start index.js --watch
pm2 logs index.js
```

For further reference, check the [PM2 documentation](https://pm2.keymetrics.io/docs/usage/quick-start/).

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

### Roadmap
Features I would like to add in the future are listed below:
* A search feature that doesn't suck (would probably require tagging and processing all chapters of the story by hand)

## License
[MIT](https://choosealicense.com/licenses/mit/)
