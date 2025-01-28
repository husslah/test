// slashCommands/setme.js
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setme")
    .setDescription("Sets up jail channels (slash).")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const checkEmoji = "<:valid:1333586993552035851>";

    await interaction.deferReply({ ephemeral: true });
    try {
      await interaction.guild.channels.create({
        name: "jail",
        type: 0,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            deny: ["SendMessages"],
          },
        ],
      });
      await interaction.guild.channels.create({ name: "jail-logs", type: 0 });
      await interaction.editReply(`${checkEmoji} Jail channels created!`);
    } catch (err) {
      console.error(err);
      await interaction.editReply("❌ Failed to create jail channels.");
    }
  },
};