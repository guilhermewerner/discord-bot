const ytdl = require('ytdl-core');
const ffmpeg = require('ffmpeg');
const timer = require('sleep');

module.exports = {
    name: 'play',
    description: "Play a song in your channel.",
    async execute(message, queue) {
        try {
            const args = message.content.split(" ");

            const serverQueue = queue.get(message.guild.id);

            const voiceChannel = message.member.voice.channel;

            if (!voiceChannel)
                return message.channel.send("You need to be in a voice channel to play music!");

            const permissions = voiceChannel.permissionsFor(message.client.user);

            if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
                return message.channel.send("I need the permissions to join and speak in your voice channel!");
            }

            const songInfo = await ytdl.getInfo(args[1]);
            const song = {
                title: songInfo.title,
                url: songInfo.video_url
            };

            if (!serverQueue) {
                const queueContruct = {
                    textChannel: message.channel,
                    voiceChannel: voiceChannel,
                    connection: null,
                    songs: [],
                    volume: 1,
                    playing: true
                };

                queue.set(message.guild.id, queueContruct);

                queueContruct.songs.push(song);

                try {
                    var connection = await voiceChannel.join();
                    queueContruct.connection = connection;

                    this.play(message.guild, queue, queueContruct.songs[0]);
                } catch (error) {
                    console.log(error);
                    queue.delete(message.guild.id);

                    return message.channel.send(error);
                }
            } else {
                serverQueue.songs.push(song);

                return message.channel.send(`**${song.title}** has been added to the queue!`);
            }
        } catch (error) {
            console.log(error);
            message.channel.send(error.message);
        }
    },

    play(guild, queue, song) {
        const serverQueue = queue.get(guild.id);

        if (!song) {
            timer.sleep(10);

            serverQueue.voiceChannel.leave();
            queue.delete(guild.id);

            return;
        }

        const dispatcher = serverQueue.connection
            .play(ytdl(song.url, { filter: "audioonly" }))
            .on("finish", () => {
                serverQueue.songs.shift();
                this.play(guild, queue, serverQueue.songs[0]);
            })
            .on("error", error => console.error(error));

        dispatcher.setVolumeLogarithmic(serverQueue.volume);
        serverQueue.textChannel.send(`Start playing: **${song.title}**`);
    }
};
