// commands/moderation/antinuke.js
const { PermissionsBitField } = require("discord.js");
const { getGuildConfig } = require("../../utils/db");

module.exports = {
  name: "antinuke",
  description: "Configure the antinuke system (prefix).",
  async execute(message, args) {
    const checkEmoji = "<:valid:1333586993552035851>"; 

    // Must be Administrator
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("You need Administrator permission to use this command.");
    }

    const gCfg = await getGuildConfig(message.guild.id);

    // e.g. .antinuke admin @User
    if (args[0] === "admin") {
      const targetUser = message.mentions.users.first();
      if (!targetUser) return message.reply("Please mention a user.");
      if (!gCfg.admins.includes(targetUser.id)) {
        gCfg.admins.push(targetUser.id);
      }
      await gCfg.save();
      return message.reply(`${checkEmoji} **${targetUser.tag}** added as Antinuke admin.`);
    }

    // e.g. .antinuke channel on --threshold 2 --do ban
    const moduleName = args[0]?.toLowerCase();
    const state = args[1]?.toLowerCase();
    if (!moduleName || !gCfg.modules[moduleName]) {
      return message.reply("Invalid module. (Examples: channel, role, emoji, ban, etc.)");
    }

    if (state === "on") {
      const options = args.slice(2).join(" ");
      const thresholdMatch = options.match(/--threshold (\d+)/);
      const punishMatch = options.match(/--do (\w+)/);

      const threshold = thresholdMatch
        ? parseInt(thresholdMatch[1])
        : gCfg.modules[moduleName].threshold;
      const punishment = punishMatch
        ? punishMatch[1]
        : gCfg.modules[moduleName].punishment;

      gCfg.modules[moduleName].enabled = true;
      if (gCfg.modules[moduleName].threshold !== undefined) {
        gCfg.modules[moduleName].threshold = threshold;
      }
      gCfg.modules[moduleName].punishment = punishment;
      await gCfg.save();

      return message.reply(
        `${checkEmoji} Enabled **${moduleName}**. Threshold = **${threshold}**, Punishment = **${punishment}**.`
      );
    } else if (state === "off") {
      gCfg.modules[moduleName].enabled = false;
      await gCfg.save();
      return message.reply(`${checkEmoji} Disabled **${moduleName}** module.`);
    }
  },
};