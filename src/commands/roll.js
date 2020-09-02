module.exports = {
    name: 'roll',
    description: 'Roll a dice',
    execute(message) {
        const query = message.content.split(/ (.*)/)[1];

        if (!query || query <= 0)
            return message.reply("Invalid number. Please provide a number greater than zero!");

        const min = 0;
        const max = query;

        const random = Math.floor(Math.random() * (+max + 1 - +min)) + +min;

        return message.reply(`You rolled a d${max} and got ${random}`);
    },
};
