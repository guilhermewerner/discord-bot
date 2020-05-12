const fs = require('fs')

module.exports = {
    name: 'help',
    description: 'List all available commands.',
    execute(message) {
        let str = '';
        const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(`./${file}`);
            str += `${process.env.PREFIX}${command.name} - ${command.description} \n`;
        }

        message.channel.send("```" + str + "```");
    },
};
