// events/webhookUpdate.js
const { AuditLogEvent } = require("discord.js");
const { getGuildConfig } = require("../utils/db");
const { punish } = require("../utils/punish");

module.exports = {
  name: "webhookUpdate",
  async execute(guild, client) {
    if (!guild) return;

    try {
      const gCfg = await getGuildConfig(guild.id);
      const webhookMod = gCfg.modules.webhook;
      if (!webhookMod.enabled) return;

      const logs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.WebhookUpdate });
      const entry = logs.entries.first();
      if (!entry) return;

      const { executor } = entry;
      if (!executor) return;

      if (gCfg.whitelist.includes(executor.id) || gCfg.admins.includes(executor.id)) return;

      const prevCount = webhookMod.actions.get(executor.id) || 0;
      webhookMod.actions.set(executor.id, prevCount + 1);

      if (webhookMod.actions.get(executor.id) >= webhookMod.threshold) {
        await punish(guild, executor.id, webhookMod.punishment);
        webhookMod.actions.set(executor.id, 0);
      }
      await gCfg.save();
    } catch (err) {
      console.error(err);
    }
  },
};