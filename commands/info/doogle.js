const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ms = require('ms'); // for human-readable time durations
const dayjs = require('dayjs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('doogle')
    .setDescription('Fetch public account info (safe & compliant)')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('User to look up')
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    // Basic data
    const createdAt = user.createdAt;
    const joinedAt = member?.joinedAt;
    const isBot = user.bot ? '🤖 Bot Account' : '👤 Human User';
    const isSystem = user.system ? '⚙️ System User' : '';

    // Derived info
    const accountAge = ms(Date.now() - createdAt.getTime(), { long: true });
    const joinAge = joinedAt ? ms(Date.now() - joinedAt.getTime(), { long: true }) : 'N/A';

    const roleCount = member ? member.roles.cache.filter(r => r.id !== interaction.guild.id).size : 0;

    // OPTIONAL: Mutual guilds (with your bot only)
    const mutualGuilds = interaction.client.guilds.cache.filter(g => g.members.cache.has(user.id)).size;

    // Embed
    const embed = new EmbedBuilder()
      .setTitle(`🔍 Doogle Lookup: ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setColor(isBot ? 0x5865F2 : 0xFF5555)
      .addFields(
        { name: 'Account Created', value: `${dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss')}\n(${accountAge} ago)`, inline: true },
        { name: 'Joined Server', value: joinedAt ? `${dayjs(joinedAt).format('YYYY-MM-DD HH:mm:ss')}\n(${joinAge} ago)` : 'Not in this server', inline: true },
        { name: 'Account Type', value: `${isBot} ${isSystem}`, inline: false },
        { name: 'Role Count', value: `${roleCount}`, inline: true },
        { name: 'Mutual Guilds (with bot)', value: `${mutualGuilds}`, inline: true },
      )
      .setFooter({ text: 'Doogle Safe • Uses only public Discord data' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: false });
  },
};
