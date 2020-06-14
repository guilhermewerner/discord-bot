const Youtube = require('simple-youtube-api');

const ytdl = require('ytdl-core');
const ffmpeg = require('ffmpeg');

const prefix = process.env.PREFIX;

const youtube = new Youtube(process.env.YOUTUBE_API_KEY);

module.exports = {
    name: 'play',
    description: "Play a song in your channel.",
    async execute(message, queue) {
        try {
            var query = message.content.split(/ (.*)/)[1];

            const voiceChannel = message.member.voice.channel;

            if (!voiceChannel)
                return message.channel.send("You need to be in a voice channel to play music!");

            const permissions = voiceChannel.permissionsFor(message.client.user);

            if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
                return message.channel.send("I need the permissions to join and speak in your voice channel!");
            }

            // If the user entered a youtube playlist url
            if (query.match(/^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/)) {
                const playlist = await youtube.getPlaylist(query).catch(function () {
                    return message.channel.send('Playlist is either private or it does not exist!');
                });

                const videos = await playlist.getVideos(10).catch(function () {
                    return message.channel.send('There was a problem getting one of the videos in the playlist!');
                });

                for (let i = 0; i < videos.length; i++) {
                    const video = await videos[i].fetch();

                    const songInfo = await ytdl.getInfo(video.url);
                    const song = {
                        title: songInfo.title,
                        url: songInfo.video_url
                    };

                    await this.addToQueue(message, queue, song, true);
                }

                return message.channel.send(`${videos.length} songs has been added to the queue!`);
            }

            // If the user entered a youtube video url
            if (query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
                /*
                query = query
                    .replace(/(>|<)/gi, '')
                    .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);

                const id = query[2].split(/[^0-9a-z_\-]/i)[0];

                const video = await youtube.getVideoByID(id).catch(function () {
                    return message.say('There was a problem getting the video you provided!');
                });

                if (video.raw.snippet.liveBroadcastContent === 'live')
                    return message.say("I don't support live streams!");
                */

                const songInfo = await ytdl.getInfo(query);
                const song = {
                    title: songInfo.title,
                    url: songInfo.video_url
                };

                return await this.addToQueue(message, queue, song, false);
            }

            // If the user entered a youtube video name
            const videos = await youtube.searchVideos(query, 1).catch(function () {
                return message.channel.send('There was a problem searching the video you requested!');
            });

            if (videos.length < 1)
                return message.channel.send(`I had some trouble finding what you were looking for, please try again or be more specific`);

            /**
             * Create music selection message
             */
            /*
            let str = '';

            for (let i = 0; i < videos.length; i++) {
                str += `${i + 1}: ${videos[i].title} \n`;
            }

            str += `\n0: Cancel \n`;

            message.channel.send("```" + str + "```");
            */
            try {
                /*
                message.channel.awaitMessages(
                    (msg) => {
                        return (msg.content > 0 && msg.content < 6) || msg.content === 0;
                    },
                    {
                        max: 1,
                        time: 60000,
                        errors: ['time']
                    }
                ).then(async (res) => {
                    const videoIndex = parseInt(res.first().content);

                    //if (res.first().content === 0)
                    //return message.channel.send("Selection canceled!");

                    const songInfo = await ytdl.getInfo(videos[videoIndex - 1].url);
                    const song = {
                        title: songInfo.title,
                        url: songInfo.video_url
                    };

                    return await this.addToQueue(message, queue, song, false);
                });
                */
                const songInfo = await ytdl.getInfo(videos[0].url);
                const song = {
                    title: songInfo.title,
                    url: songInfo.video_url
                };

                return await this.addToQueue(message, queue, song, false);
            } catch (error) {
                console.log(error);

                return message.channel.send('An error has occured when trying to get the video from youtube!');
            }
        } catch (error) {
            console.log(error);
            message.channel.send(error.message);
        }
    },

    async addToQueue(message, queue, song, isPlaylist) {
        const serverQueue = queue.get(message.guild.id);

        const voiceChannel = message.member.voice.channel;

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

                this.playMusic(message.guild, queue, queueContruct.songs[0]);
            } catch (error) {
                console.log(error);
                queue.delete(message.guild.id);

                return message.channel.send(error);
            }
        } else {
            serverQueue.songs.push(song);

            if (!isPlaylist)
                return message.channel.send(`**${song.title}** has been added to the queue!`);
        }
    },

    playMusic(guild, queue, song) {
        const serverQueue = queue.get(guild.id);

        if (!song) {
            serverQueue.voiceChannel.leave();
            queue.delete(guild.id);

            return;
        }

        const dispatcher = serverQueue.connection
            .play(ytdl(song.url, {
                filter: "audioonly",
                quality: 'highestaudio'
            }))
            .on("finish", () => {
                serverQueue.songs.shift();
                this.playMusic(guild, queue, serverQueue.songs[0]);
            })
            .on("error", error => console.error(error));

        dispatcher.setVolumeLogarithmic(serverQueue.volume);
        serverQueue.textChannel.send(`Start playing: **${song.title}**`);
    }
};
