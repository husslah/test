// slashCommands/antinuke.js
const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { getGuildConfig } = require("../utils/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("antinuke")
    .setDescription("Configure the antinuke system (slash).")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(sub =>
      sub
        .setName("admin")
        .setDescription("Add a user as an antinuke admin.")
        .addUserOption(o =>
          o.setName("user").setDescription("User to admin.").setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("module")
        .setDescription("Enable/disable modules, set threshold/punishment.")
        .addStringOption(o =>
          o
            .setName("name")
            .setDescription("Module name: channel, role, etc.")
            .setRequired(true)
        )
        .addStringOption(o =>
          o
            .setName("state")
            .setDescription("on/off")
            .setRequired(true)
            .addChoices({ name: "on", value: "on" }, { name: "off", value: "off" })
        )
        .addIntegerOption(o =>
          o.setName("threshold").setDescription("Threshold for actions.")
        )
        .addStringOption(o =>
          o.setName("punishment").setDescription("ban/kick/jail/stripstaff?")
        )
    ),

  async execute(interaction) {
    const checkEmoji = "<:valid:1333586993552035851>";
    const gCfg = await getGuildConfig(interaction.guild.id);
    const sub = interaction.options.getSubcommand();

    if (sub === "admin") {
      const user = interaction.options.getUser("user");
      if (!user) {
        return interaction.reply({ content: "No user?", ephemeral: true });
      }
      if (!gCfg.admins.includes(user.id)) {
        gCfg.admins.push(user.id);
      }
      await gCfg.save();
      return interaction.reply({
        content: `${checkEmoji} **${user.tag}** is now an Antinuke admin.`,
        ephemeral: true
      });
    }

    if (sub === "module") {
      const moduleName = interaction.options.getString("name").toLowerCase();
      const state = interaction.options.getString("state");
      const threshold = interaction.options.getInteger("threshold");
      const punishStr = interaction.options.getString("punishment");

      if (!gCfg.modules[moduleName]) {
        return interaction.reply({ content: `Module "${moduleName}" not found.`, ephemeral: true });
      }

      if (state === "on") {
        gCfg.modules[moduleName].enabled = true;
        if (threshold !== null && gCfg.modules[moduleName].threshold !== undefined) {
          gCfg.modules[moduleName].threshold = threshold;
        }
        if (punishStr) {
          gCfg.modules[moduleName].punishment = punishStr;
        }
        await gCfg.save();
        return interaction.reply({
          content: `${checkEmoji} Enabled **${moduleName}**. Threshold: **${gCfg.modules[moduleName].threshold}**, Punishment: **${gCfg.modules[moduleName].punishment}**.`,
          ephemeral: true
        });
      } else {
        gCfg.modules[moduleName].enabled = false;
        await gCfg.save();
        return interaction.reply({ content: `${checkEmoji} Disabled **${moduleName}** module.`, ephemeral: true });
      }
    }
  },
};