// commands/moderation/setme.js
const { PermissionsBitField } = require("discord.js");

module.exports = {
  name: "setme",
  description: "Sets up jail channels (prefix).",
  async execute(message) {
    const checkEmoji = "<:valid:1333586993552035851>";

    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("You need Administrator permission.");
    }

    const loadingMsg = await message.reply("⏳ Setting up jail channels...");

    try {
      await message.guild.channels.create({
        name: "jail",
        type: 0,
        permissionOverwrites: [
          {
            id: message.guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.SendMessages],
          },
        ],
      });
      await message.guild.channels.create({ name: "jail-logs", type: 0 });

      loadingMsg.edit(`${checkEmoji} Jail setup complete.`);
    } catch (err) {
      console.error(err);
      loadingMsg.edit("❌ Failed to create jail channels.");
    }
  },
};