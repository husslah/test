// events/roleDelete.js
const { AuditLogEvent } = require("discord.js");
const { getGuildConfig } = require("../utils/db");
const { punish } = require("../utils/punish");

module.exports = {
  name: "roleDelete",
  async execute(role, client) {
    const guild = role.guild;
    if (!guild) return;

    try {
      const gCfg = await getGuildConfig(guild.id);
      const roleMod = gCfg.modules.role;
      if (!roleMod.enabled) return;

      const logs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.RoleDelete });
      const entry = logs.entries.first();
      if (!entry) return;

      const { executor } = entry;
      if (!executor) return;

      if (gCfg.whitelist.includes(executor.id) || gCfg.admins.includes(executor.id)) return;

      const prevCount = roleMod.actions.get(executor.id) || 0;
      roleMod.actions.set(executor.id, prevCount + 1);

      if (roleMod.actions.get(executor.id) >= roleMod.threshold) {
        await punish(guild, executor.id, roleMod.punishment);
        roleMod.actions.set(executor.id, 0);
      }
      await gCfg.save();
    } catch (err) {
      console.error(err);
    }
  },
};