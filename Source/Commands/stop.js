module.exports = {
    name: 'stop',
    description: 'Stop current queue.',
    aliases: [],
    execute(message, queue) {
        const serverQueue = queue.get(message.guild.id);

        if (!message.member.voice.channel)
            return message.channel.send("You have to be in a voice channel to stop the music!");

        serverQueue.songs = [];
        serverQueue.connection.dispatcher.end();
    },
};
