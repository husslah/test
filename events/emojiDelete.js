// events/emojiDelete.js
const { AuditLogEvent } = require("discord.js");
const { getGuildConfig } = require("../utils/db");
const { punish } = require("../utils/punish");

module.exports = {
  name: "emojiDelete",
  async execute(emoji, client) {
    const guild = emoji.guild;
    if (!guild) return;

    try {
      const gCfg = await getGuildConfig(guild.id);
      const emojiMod = gCfg.modules.emoji;
      if (!emojiMod.enabled) return;

      const logs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.EmojiDelete });
      const entry = logs.entries.first();
      if (!entry) return;

      const { executor } = entry;
      if (!executor) return;

      if (gCfg.whitelist.includes(executor.id) || gCfg.admins.includes(executor.id)) return;

      const prevCount = emojiMod.actions.get(executor.id) || 0;
      emojiMod.actions.set(executor.id, prevCount + 1);

      if (emojiMod.actions.get(executor.id) >= emojiMod.threshold) {
        await punish(guild, executor.id, emojiMod.punishment);
        emojiMod.actions.set(executor.id, 0);
      }
      await gCfg.save();
    } catch (err) {
      console.error(err);
    }
  },
};