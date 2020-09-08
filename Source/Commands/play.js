const Youtube = require('simple-youtube-api');

const ytdl = require('ytdl-core');
const ffmpeg = require('ffmpeg');

const youtube = new Youtube(process.env.YOUTUBE_API_KEY);

module.exports = {
    name: 'play',
    description: "Play a song in your channel.",
    async execute(message, queue) {
        try {
            var query = message.content.split(/ (.*)/)[1];

            const voiceChannel = message.member.voice.channel;

            if (!voiceChannel)
                return message.reply("You need to be in a voice channel to play music!");

            const permissions = voiceChannel.permissionsFor(message.client.user);

            if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
                return message.reply("I need the permissions to join and speak in your voice channel!");
            }

            // If the user entered a youtube playlist url
            if (query.match(/^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/)) {
                const playlist = await youtube.getPlaylist(query).catch(function () {
                    return message.reply('Playlist is either private or it does not exist!');
                });

                const videos = await playlist.getVideos(10).catch(function () {
                    return message.reply('There was a problem getting one of the videos in the playlist!');
                });

                for (let i = 0; i < videos.length; i++) {
                    const video = await videos[i].fetch();

                    const songInfo = await ytdl.getInfo(video.url);
                    const song = {
                        title: songInfo.title,
                        url: songInfo.video_url,
                        thumbnail: songInfo.player_response.videoDetails.thumbnail.thumbnails[0].url,
                        author: songInfo.player_response.videoDetails.author,
                        seconds: songInfo.length_seconds,
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
                    url: songInfo.video_url,
                    thumbnail: songInfo.player_response.videoDetails.thumbnail.thumbnails[0].url,
                    author: songInfo.player_response.videoDetails.author,
                    seconds: songInfo.length_seconds,
                };

                return await this.addToQueue(message, queue, song, false);
            }

            // If the user entered a youtube video name
            const videos = await youtube.searchVideos(query, 5).catch(function () {
                return message.channel.send('There was a problem searching the video you requested!');
            });

            // Canot find 5 valid videos
            if (videos.length < 5)
                return message.channel.send(`I had some trouble finding what you were looking for, please try again or be more specific`);

            /* MUSIC SELECTION MESSAGE */

            let str = '';

            for (let i = 0; i < videos.length; i++) {
                str += `**[${i + 1}]**: ${videos[i].title} \n`;
            }

            str += `\n**[0]**: Cancel \n`;

            //message.channel.send("```" + str + "```");

            const embedMessage = {
                color: 0x673ab7,
                author: {
                    name: 'Select Music'
                },
                description: str,
            };

            /* MUSIC SELECTION MESSAGE */

            message.channel.send({ embed: embedMessage });

            try {

                /* WHAIT 20 SECONDS FOR SELECTION MESSAGE */

                message.channel.awaitMessages(
                    (msg) => {
                        return (msg.content > 0 && msg.content < 6) || msg.content === "0";
                    },
                    {
                        max: 1,
                        time: 20000,
                        errors: ['time']
                    }
                ).then(async (response) => {
                    const videoIndex = parseInt(response.first().content);

                    if (response.first().content === "0") {
                        embedMessage.delete();
                        return message.reply("Selection canceled!");
                    }

                    const songInfo = await ytdl.getInfo(videos[videoIndex - 1].url);
                    const song = {
                        title: songInfo.title,
                        url: songInfo.video_url,
                        thumbnail: songInfo.player_response.videoDetails.thumbnail.thumbnails[0].url,
                        author: songInfo.player_response.videoDetails.author,
                        seconds: songInfo.length_seconds,
                    };

                    return await this.addToQueue(message, queue, song, false);
                });

                /* WHAIT 20 SECONDS FOR SELECTION MESSAGE */

            } catch (error) {
                console.log(error);

                return message.reply('An error has occured when trying to get the video from youtube!');
            }
        } catch (error) {
            console.log(error);
            message.reply(error.message);
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

            if (!isPlaylist) {
                //return message.channel.send(`**${song.title}** has been added to the queue!`);

                /* CUSTON EMBED MESSAGE */

                const date = new Date(0);
                date.setSeconds(song.seconds);
                const duration = date.toISOString().substr(11, 8);

                const embedMessage = {
                    color: 0x673ab7,
                    title: song.title,
                    url: song.url,
                    author: {
                        name: 'Added to the list'
                    },
                    thumbnail: {
                        url: song.thumbnail,
                    },
                    fields: [
                        {
                            name: 'Author',
                            value: song.author,
                            inline: true,
                        },
                        {
                            name: 'Duration',
                            value: duration,
                            inline: true,
                        },
                    ],
                };

                /* CUSTON EMBED MESSAGE */

                return serverQueue.textChannel.send({ embed: embedMessage });
            }
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

        //serverQueue.textChannel.send(`Start playing: **${song.title}**`);

        const date = new Date(0);
        date.setSeconds(song.seconds);
        const duration = date.toISOString().substr(11, 8);

        const embedMessage = {
            color: 0x673ab7,
            title: song.title,
            url: song.url,
            author: {
                name: 'Now Playing'
            },
            thumbnail: {
                url: song.thumbnail,
            },
            fields: [
                {
                    name: 'Author',
                    value: song.author,
                    inline: true,
                },
                {
                    name: 'Duration',
                    value: duration,
                    inline: true,
                },
            ],
        };

        serverQueue.textChannel.send({ embed: embedMessage });
    }
};
