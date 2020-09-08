module.exports = {
    name: 'list',
    description: 'Get the current music playlist.',
    aliases: [],
    execute(message, queue) {
        const serverQueue = queue.get(message.guild.id);

        if (!serverQueue)
            return message.channel.send('There is nothing playing.');

        let str = '';

        for (let i = 0; i < serverQueue.songs.length; i++) {
            str += `**[${i + 1}]**: ${serverQueue.songs[i].title} \n`;
        }

        const embedMessage = {
            color: 0x673ab7,
            author: {
                name: 'Playlist Musics'
            },
            description: str,
        };

        message.channel.send({ embed: embedMessage });
    },
};
