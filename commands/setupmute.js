// commands/moderation/setupmute.js
const { PermissionsBitField } = require("discord.js");

module.exports = {
  name: "setupmute",
  description: "Sets up mute roles (prefix).",
  async execute(message) {
    const checkEmoji = "<:valid:1333586993552035851>";

    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("You need Administrator permission.");
    }

    const loadingMsg = await message.reply("⏳ Creating mute roles...");

    try {
      await message.guild.roles.create({ name: "muted", color: "#808080", permissions: [] });
      await message.guild.roles.create({ name: "imuted", color: "#505050", permissions: [] });
      await message.guild.roles.create({ name: "rmuted", color: "#303030", permissions: [] });

      loadingMsg.edit(`${checkEmoji} Mute roles created.`);
    } catch (err) {
      console.error(err);
      loadingMsg.edit("❌ Failed to create mute roles.");
    }
  },
};