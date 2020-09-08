module.exports = {
    name: 'remove',
    description: 'Remove song index from queue.',
    aliases: [],
    execute(message, queue) {
        var query = message.content.split(/ (.*)/)[1];

        const serverQueue = queue.get(message.guild.id);

        if (!query)
            return message.channel.send("You have to be in a voice channel to pause the music!");

        if (!serverQueue)
            return message.channel.send("There is no song that I could pause!");

        serverQueue.connection.dispatcher.pause();

        return message.channel.send(`Music **${serverQueue.songs[0].title}** removed from the queue!`);
    },
};
