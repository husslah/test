// events/guildMemberRemove.js
const { AuditLogEvent } = require("discord.js");
const { getGuildConfig } = require("../utils/db");
const { punish } = require("../utils/punish");

module.exports = {
  name: "guildMemberRemove",
  async execute(member, client) {
    const guild = member.guild;
    if (!guild) return;

    try {
      const gCfg = await getGuildConfig(guild.id);
      const banMod = gCfg.modules.ban;
      const kickMod = gCfg.modules.kick;

      const logs = await guild.fetchAuditLogs({ limit: 1 });
      const entry = logs.entries.first();
      if (!entry) return;

      const { executor, action } = entry;
      if (!executor) return;

      if (gCfg.whitelist.includes(executor.id) || gCfg.admins.includes(executor.id)) return;

      // Bans
      if (banMod.enabled && action === AuditLogEvent.MemberBanAdd) {
        const prev = banMod.actions.get(executor.id) || 0;
        banMod.actions.set(executor.id, prev + 1);
        if (banMod.actions.get(executor.id) >= banMod.threshold) {
          await punish(guild, executor.id, banMod.punishment);
          banMod.actions.set(executor.id, 0);
        }
      }

      // Kicks
      if (kickMod.enabled && action === AuditLogEvent.MemberKick) {
        const prev = kickMod.actions.get(executor.id) || 0;
        kickMod.actions.set(executor.id, prev + 1);
        if (kickMod.actions.get(executor.id) >= kickMod.threshold) {
          await punish(guild, executor.id, kickMod.punishment);
          kickMod.actions.set(executor.id, 0);
        }
      }

      await gCfg.save();
    } catch (err) {
      console.error("guildMemberRemove event error:", err);
    }
  },
};