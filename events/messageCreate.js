// events/messageCreate.js
const { getGuildConfig } = require("../utils/db");
const { punish } = require("../utils/punish");

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    if (!message.guild || message.author.bot) return;

    // 1) Mass mention detection
    try {
      const gCfg = await getGuildConfig(message.guild.id);
      const mentionMod = gCfg.modules.massmention;
      if (mentionMod.enabled) {
        const mentionCount = message.mentions.users.size + message.mentions.roles.size;
        if (mentionCount >= mentionMod.threshold) {
          // punish if not whitelisted or admin
          if (!gCfg.whitelist.includes(message.author.id) && !gCfg.admins.includes(message.author.id)) {
            await punish(message.guild, message.author.id, mentionMod.punishment);
          }
        }
      }
    } catch (err) {
      console.error("Mass mention check error:", err);
    }

    // 2) Prefix command handling
    let gCfg;
    try {
      gCfg = await getGuildConfig(message.guild.id);
    } catch (err) {
      console.error(err);
      return;
    }

    const prefix = gCfg.prefix || client.prefix;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();
    const command = client.commands.get(cmdName);
    if (!command) return;

    try {
      await command.execute(message, args);
    } catch (err) {
      console.error(err);
      message.reply("❌ Error executing that command.");
    }
  },
};