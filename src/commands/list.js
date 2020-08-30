module.exports = {
    name: 'list',
    description: 'Get the current music playlist.',
    execute(message, queue) {
        const serverQueue = queue.get(message.guild.id);

        if (!serverQueue)
            return message.channel.send('There is nothing playing.');

        let str = '';

        for (let i = 0; i < serverQueue.songs.length; i++) {
            str += `${i + 1}: ${serverQueue.songs[i].title} \n`;
        }

        //const serverQueue.songs.map(song => song.name);

        return message.channel.send("```" + str + "```");
    },
};
