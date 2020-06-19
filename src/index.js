require('dotenv/config');

//pm2 start ./src/index.js --name "Discord"

const fs = require('fs');
const Discord = require('discord.js');

const prefix = process.env.PREFIX;
const token = process.env.TOKEN;

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

const queue = new Map();

client.once('ready', () => {
    console.log('Ready!');

    client.user.setActivity(`${prefix}help`, {
        type: 'PLAYING',
        url: 'https://github.com/GuilhermeWerner/DiscordBot'
    });
});

client.once('reconnecting', () => {
    console.log('Reconnecting!');
});

client.once('disconnect', () => {
    console.log('Disconnect!');
});

client.on('message', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ (.*)/);
    const command = args.shift().toLowerCase();

    if (!client.commands.has(command))
        message.reply('Please enter a valid command!');

    try {
        client.commands.get(command).execute(message, queue);
    } catch (error) {
        console.error(error);
        message.reply('There was an error trying to execute that command!');
    }
});

client.login(token);
