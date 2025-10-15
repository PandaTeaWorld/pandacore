const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dayjs = require('dayjs');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lens')
    .setDescription('Analyze a user’s behavior and potential alt indicators')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to investigate')
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    await interaction.deferReply({ ephemeral: false });

    // === Basic Info ===
    const createdAt = user.createdAt;
    const joinedAt = member?.joinedAt;
    const isBot = user.bot;
    const isSystem = user.system;
    const now = Date.now();

    const accountAgeMs = now - createdAt.getTime();
    const joinAgeMs = joinedAt ? now - joinedAt.getTime() : null;

    const accountAge = ms(accountAgeMs, { long: true });
    const joinAge = joinAgeMs ? ms(joinAgeMs, { long: true }) : 'N/A';
    const roleCount = member ? member.roles.cache.filter(r => r.id !== interaction.guild.id).size : 0;

    // === Alt Heuristics (Safe) ===
    let indicators = [];
    if (accountAgeMs < 7 * 24 * 60 * 60 * 1000) indicators.push('⚠️ Account created less than 7 days ago');
    if (joinAgeMs && joinAgeMs < 3 * 24 * 60 * 60 * 1000) indicators.push('⚠️ Joined the server very recently');
    if (roleCount <= 1) indicators.push('ℹ️ Very few roles assigned');
    if (isBot) indicators.push('🤖 This is a bot account (not an alt)');
    if (isSystem) indicators.push('⚙️ This is a system user (safe)');

    if (indicators.length === 0) indicators.push('✅ No clear alt indicators detected.');

    // === Optional Mutual Guild Count ===
    const mutualGuilds = interaction.client.guilds.cache.filter(g => g.members.cache.has(user.id)).size;

    // === Embed ===
    const embed = new EmbedBuilder()
      .setColor(0xE67E22)
      .setTitle(`🔍 Lens Report: ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Account Created', value: `${dayjs(createdAt).format('YYYY-MM-DD HH:mm:ss')}\n(${accountAge} ago)`, inline: true },
        { name: 'Joined Server', value: joinedAt ? `${dayjs(joinedAt).format('YYYY-MM-DD HH:mm:ss')}\n(${joinAge} ago)` : 'Not in this server', inline: true },
        { name: 'Account Type', value: isBot ? '🤖 Bot' : isSystem ? '⚙️ System' : '👤 Human', inline: true },
        { name: 'Role Count', value: `${roleCount}`, inline: true },
        { name: 'Mutual Guilds (with bot)', value: `${mutualGuilds}`, inline: true },
        { name: 'Alt Indicators', value: indicators.join('\n'), inline: false },
      )
      .setFooter({ text: 'Lens Report • Uses only public Discord data' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
