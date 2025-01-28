// utils/deploy-commands.js
const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID; // optional

const slashCommands = [];

function readSlashCommands(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      readSlashCommands(fullPath);
    } else if (file.endsWith(".js")) {
      const cmd = require(fullPath);
      if (cmd.data) {
        slashCommands.push(cmd.data.toJSON());
      }
    }
  }
}

readSlashCommands(path.join(__dirname, "..", "slashCommands"));
console.log(`Found ${slashCommands.length} slash commands.`);

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    if (!clientId) throw new Error("CLIENT_ID not set!");
    if (guildId) {
      // per-guild
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
        body: slashCommands,
      });
      console.log("Successfully registered slash commands (guild).");
    } else {
      // global
      await rest.put(Routes.applicationCommands(clientId), {
        body: slashCommands,
      });
      console.log("Successfully registered slash commands (global).");
    }
  } catch (err) {
    console.error(err);
  }
})();