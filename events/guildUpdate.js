// events/guildUpdate.js
const { AuditLogEvent } = require("discord.js");
const { getGuildConfig } = require("../utils/db");
const { punish } = require("../utils/punish");

module.exports = {
  name: "guildUpdate",
  async execute(oldGuild, newGuild, client) {
    const guild = newGuild;
    if (!guild) return;

    try {
      const gCfg = await getGuildConfig(guild.id);
      const guildMod = gCfg.modules.guild;
      if (!guildMod.enabled) return;

      const logs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.GuildUpdate });
      const entry = logs.entries.first();
      if (!entry) return;

      const { executor } = entry;
      if (!executor) return;

      if (gCfg.whitelist.includes(executor.id) || gCfg.admins.includes(executor.id)) return;

      const prevCount = guildMod.actions.get(executor.id) || 0;
      guildMod.actions.set(executor.id, prevCount + 1);

      if (guildMod.actions.get(executor.id) >= guildMod.threshold) {
        await punish(guild, executor.id, guildMod.punishment);
        guildMod.actions.set(executor.id, 0);
      }
      await gCfg.save();
    } catch (err) {
      console.error(err);
    }
  },
};