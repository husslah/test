// events/channelCreate.js
const { AuditLogEvent } = require("discord.js");
const { getGuildConfig } = require("../utils/db");
const { punish } = require("../utils/punish");

module.exports = {
  name: "channelCreate",
  async execute(channel, client) {
    const guild = channel.guild;
    if (!guild) return;

    try {
      const gCfg = await getGuildConfig(guild.id);
      const createMod = gCfg.modules.channelcreate;
      if (!createMod.enabled) return;

      const logs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.ChannelCreate });
      const entry = logs.entries.first();
      if (!entry) return;

      const { executor } = entry;
      if (!executor) return;

      if (gCfg.whitelist.includes(executor.id) || gCfg.admins.includes(executor.id)) return;

      const prev = createMod.actions.get(executor.id) || 0;
      createMod.actions.set(executor.id, prev + 1);

      if (createMod.actions.get(executor.id) >= createMod.threshold) {
        await punish(guild, executor.id, createMod.punishment);
        createMod.actions.set(executor.id, 0);
      }
      await gCfg.save();
    } catch (err) {
      console.error("channelCreate event error:", err);
    }
  },
};