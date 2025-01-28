// slashCommands/setupmute.js
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setupmute")
    .setDescription("Sets up mute roles (slash).")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const checkEmoji = "<:valid:1333586993552035851>";
    await interaction.deferReply({ ephemeral: true });
    try {
      await interaction.guild.roles.create({ name: "muted", color: "#808080", permissions: [] });
      await interaction.guild.roles.create({ name: "imuted", color: "#505050", permissions: [] });
      await interaction.guild.roles.create({ name: "rmuted", color: "#303030", permissions: [] });

      await interaction.editReply(`${checkEmoji} Mute roles created!`);
    } catch (err) {
      console.error(err);
      await interaction.editReply("❌ Failed to create mute roles.");
    }
  },
};