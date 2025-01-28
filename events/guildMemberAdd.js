// events/guildMemberAdd.js
const { AuditLogEvent } = require("discord.js");
const { getGuildConfig } = require("../utils/db");
const { punish } = require("../utils/punish");

module.exports = {
  name: "guildMemberAdd",
  async execute(member, client) {
    const guild = member.guild;
    if (!guild) return;

    const gCfg = await getGuildConfig(guild.id);
    const botAddMod = gCfg.modules.botadd;
    if (!botAddMod.enabled) return;

    if (member.user.bot) {
      try {
        const logs = await guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.BotAdd });
        const entry = logs.entries.first();
        if (!entry) return;

        const { executor, target } = entry;
        if (!executor) return;
        if (target.id !== member.id) return;

        if (!gCfg.whitelist.includes(executor.id) && !gCfg.admins.includes(executor.id)) {
          await punish(guild, executor.id, "ban");
        }
      } catch (err) {
        console.error("BotAdd detection error:", err);
      }
    }
  },
};