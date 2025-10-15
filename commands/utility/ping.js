const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDMPermission(false)
        .setDescription('Replies with Pong!'),
        category: 'utility',
    async execute(interaction) {
        interaction.reply(`:ping_pong: Pong!`);
    },
};