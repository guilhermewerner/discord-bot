# DiscordBot

A simple discord bot for listen musics and playlist with your friends.
Written in JavaScript, using discord.js library and the YouTube API

### Requirements

- [Node](https://nodejs.org/en/)
- [FFmpeg](https://ffmpeg.org/)

### Instalation

After clone the repository, install the dependencies using:

`npm install`

### Configuration

Create a .env file in the project root and add:

```
PREFIX=+
TOKEN=YOUR_DISCORD_TOKEN
YOUTUBE_API_KEY=YOUR_YOUTUBE_API_KEY
```

### Starting the Bot

`npm start`

### Publishing

You can host the bot on your own computer or use a service to keep it online 24/7

### Commands

| Command               | Description                     | Example                               |
| --------------------- | ------------------------------- | ------------------------------------- |
| +help                 | List all available commands     | +help                                 |
| +play                 | Play a song in your channel     | +play old town road                   |
| +skip                 | Skip current song               | +skip                                 |
| +stop                 | Stop current queue              | +stop                                 |
| +now                  | Get the name of current song    | +now                                  |
| +list                 | Get the current playing list    | +list                                 |
| +pause                | Pause playing music             | +pause                                |
| +resume               | Unpause playing music           | +resume                               |
| +roll                 | Roll a custom dice              | +roll 12                              |

### Contributing

Anyone can submit a pull request and improve the project. New features comes soon.

### Author

Guilherme Werner

### Liscence

This project is licensed under the MIT License.
