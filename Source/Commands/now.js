module.exports = {
    name: 'now',
    description: 'Get the name of current song.',
    aliases: [],
    execute(message, queue) {
        const serverQueue = queue.get(message.guild.id);

        if (!serverQueue)
            return message.channel.send('There is nothing playing.');

        return message.channel.send(`Now playing: **${serverQueue.songs[0].title}**`);
    },
};
