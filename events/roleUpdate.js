// events/roleUpdate.js
const { AuditLogEvent, PermissionsBitField } = require("discord.js");
const { getGuildConfig } = require("../utils/db");
const { punish } = require("../utils/punish");

module.exports = {
  name: "roleUpdate",
  async execute(oldRole, newRole, client) {
    const guild = newRole.guild;
    if (!guild) return;

    try {
      const gCfg = await getGuildConfig(guild.id);
      const permMod = gCfg.modules.permissions;
      if (!permMod.enabled) return;

      const oldPerms = oldRole.permissions;
      const newPerms = newRole.permissions;
      // If newRole gained "administrator"
      if (!oldPerms.has(PermissionsBitField.Flags.Administrator) &&
          newPerms.has(PermissionsBitField.Flags.Administrator)) {
        const logs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.RoleUpdate });
        const entry = logs.entries.first();
        if (!entry) return;

        const { executor } = entry;
        if (!executor) return;

        if (!gCfg.whitelist.includes(executor.id) && !gCfg.admins.includes(executor.id)) {
          await punish(guild, executor.id, permMod.punishment);
        }
      }
    } catch (err) {
      console.error("roleUpdate event error:", err);
    }
  },
};