// utils/punish.js
const { PermissionsBitField } = require("discord.js");

async function punish(guild, userId, punishment) {
  const member = await guild.members.fetch(userId).catch(() => null);
  if (!member) return;

  switch (punishment) {
    case "ban":
      if (member.bannable) {
        await member.ban({ reason: "Antinuke punishment" }).catch(() => {});
      }
      break;

    case "kick":
      if (member.kickable) {
        await member.kick("Antinuke punishment").catch(() => {});
      }
      break;

    case "stripstaff": {
      for (const role of member.roles.cache.values()) {
        if (role.permissions.has(PermissionsBitField.Flags.Administrator) ||
            role.permissions.has(PermissionsBitField.Flags.ManageGuild) ||
            role.permissions.has(PermissionsBitField.Flags.ManageChannels) ||
            role.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
          await member.roles.remove(role).catch(() => {});
        }
      }
      break;
    }

    case "jail": {
      let jailedRole = guild.roles.cache.find(r => r.name.toLowerCase() === "jailed");
      if (!jailedRole) {
        try {
          jailedRole = await guild.roles.create({
            name: "Jailed",
            color: "#2F3136",
            permissions: []
          });
        } catch (err) {
          console.error("Failed to create Jailed role:", err);
        }
      }
      if (jailedRole) {
        const rolesToRemove = member.roles.cache.filter(r => r.id !== guild.id);
        for (const r of rolesToRemove.values()) {
          await member.roles.remove(r).catch(() => {});
        }
        await member.roles.add(jailedRole).catch(() => {});
      }
      break;
    }

    default:
      // unknown punishment
      break;
  }
}

module.exports = { punish };