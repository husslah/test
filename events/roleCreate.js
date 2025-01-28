// events/roleCreate.js
const { AuditLogEvent } = require("discord.js");
const { getGuildConfig } = require("../utils/db");
const { punish } = require("../utils/punish");

module.exports = {
  name: "roleCreate",
  async execute(role, client) {
    const guild = role.guild;
    if (!guild) return;

    try {
      // Fetch guild config
      const gCfg = await getGuildConfig(guild.id);
      const roleMod = gCfg.modules.role;

      // Check if the role module is enabled
      if (!roleMod.enabled) return;

      // Get audit log entry for the new role creation
      const logs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.RoleCreate });
      const entry = logs.entries.first();
      if (!entry) return;

      // Extract the user (executor) who created the role
      const { executor } = entry;
      if (!executor) return;

      // Skip if user is whitelisted or an admin
      if (gCfg.whitelist.includes(executor.id) || gCfg.admins.includes(executor.id)) return;

      // Tally up how many times this user has created roles recently
      const prevCount = roleMod.actions.get(executor.id) || 0;
      roleMod.actions.set(executor.id, prevCount + 1);

      // If user crossed threshold, apply punishment and reset count
      if (roleMod.actions.get(executor.id) >= roleMod.threshold) {
        await punish(guild, executor.id, roleMod.punishment);
        roleMod.actions.set(executor.id, 0);
      }

      // Save updated config
      await gCfg.save();

    } catch (err) {
      console.error(err);
    }
  },
};