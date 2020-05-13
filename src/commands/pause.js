module.exports = {
    name: 'pause',
    description: 'Pause queue.',
    execute(message, queue) {
        const serverQueue = queue.get(message.guild.id);

        if (!message.member.voice.channel)
            return message.channel.send("You have to be in a voice channel to pause the music!");

        if (!serverQueue)
            return message.channel.send("There is no song that I could pause!");

        serverQueue.connection.dispatcher.pause();

        return message.channel.send(`Music **${serverQueue.songs[0].title}** paused!`);
    },
};
