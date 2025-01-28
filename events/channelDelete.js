// events/channelDelete.js
const { AuditLogEvent } = require("discord.js");
const { getGuildConfig } = require("../utils/db");
const { punish } = require("../utils/punish");

module.exports = {
  name: "channelDelete",
  async execute(channel, client) {
    const guild = channel.guild;
    if (!guild) return;

    try {
      const gCfg = await getGuildConfig(guild.id);
      const channelMod = gCfg.modules.channel;
      if (!channelMod.enabled) return;

      const logs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelDelete });
      const entry = logs.entries.first();
      if (!entry) return;

      const { executor } = entry;
      if (!executor) return;

      if (gCfg.whitelist.includes(executor.id) || gCfg.admins.includes(executor.id)) return;

      const prevCount = channelMod.actions.get(executor.id) || 0;
      channelMod.actions.set(executor.id, prevCount + 1);

      if (channelMod.actions.get(executor.id) >= channelMod.threshold) {
        await punish(guild, executor.id, channelMod.punishment);
        channelMod.actions.set(executor.id, 0);
      }
      await gCfg.save();
    } catch (err) {
      console.error("channelDelete event error:", err);
    }
  },
};