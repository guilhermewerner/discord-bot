module.exports = {
    name: 'resume',
    description: 'Resume queue.',
    aliases: [ 'unpause' ],
    execute(message, queue) {
        const serverQueue = queue.get(message.guild.id);

        if (!message.member.voice.channel)
            return message.channel.send("You have to be in a voice channel to resume the music!");

        if (!serverQueue)
            return message.channel.send("There is no song that I could resume!");

        serverQueue.connection.dispatcher.resume();

        return message.channel.send(`Music **${serverQueue.songs[0].title}** resumed!`);
    },
};
