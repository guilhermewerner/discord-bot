const embedMessage = {
    color: 0x673ab7,
    title: song.title,
    url: song.url,
    author: {
        name: 'Now Playing'
    },
    //description: 'Some description here',
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
            value: '00:03:25',
            inline: true,
        },
    ],
    /*
    image: {
        url: 'https://i.imgur.com/wSTFkRM.png',
    },
    */
    //timestamp: new Date(),
    /*
    footer: {
        text: 'Some footer text here',
        icon_url: 'https://i.imgur.com/wSTFkRM.png',
    },
    */
};
