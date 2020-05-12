require('dotenv/config');

const Discord = require('discord.js');
const ytdl = require('ytdl-core');

const prefix = ">";
const token = process.env.TOKEN;

const client = new Discord.Client();

client.login(token);

client.once('ready', () => {
    console.log('Ready!');
});
client.once('reconnecting', () => {
    console.log('Reconnecting!');
});
client.once('disconnect', () => {
    console.log('Disconnect!');
});
