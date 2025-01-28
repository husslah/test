
// Load environment variables from .env file
require('dotenv').config();
// index.js
const { Client, Collection, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { connectDB } = require("./utils/db");

(async function startBot() {
  // 1) Connect to Mongo
  await connectDB();

  // 2) Create client
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildBans,
      GatewayIntentBits.GuildEmojisAndStickers,
      GatewayIntentBits.GuildWebhooks
    ],
  });

  // Collections for prefix & slash
  client.commands = new Collection();
  client.slashCommands = new Collection();
  // Default prefix is "."
  client.prefix = ".";

  // Load prefix commands
  function loadCommands(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.lstatSync(fullPath).isDirectory()) {
        loadCommands(fullPath);
      } else if (file.endsWith(".js")) {
        const cmd = require(fullPath);
        if (cmd.name) {
          client.commands.set(cmd.name, cmd);
          console.log(`Loaded prefix command: ${cmd.name}`);
        }
      }
    }
  }
  loadCommands(path.join(__dirname, "commands"));

  // Load slash commands
  function loadSlashCommands(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.lstatSync(fullPath).isDirectory()) {
        loadSlashCommands(fullPath);
      } else if (file.endsWith(".js")) {
        const slashCmd = require(fullPath);
        if (slashCmd.data && slashCmd.data.name) {
          client.slashCommands.set(slashCmd.data.name, slashCmd);
          console.log(`Loaded slash command: ${slashCmd.data.name}`);
        }
      }
    }
  }
  loadSlashCommands(path.join(__dirname, "slashCommands"));

  // Load events
  function loadEvents(dir) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".js"));
    for (const file of files) {
      const event = require(path.join(dir, file));
      if (event.name) {
        client.on(event.name, (...args) => event.execute(...args, client));
        console.log(`Loaded event: ${event.name}`);
      }
    }
  }
  loadEvents(path.join(__dirname, "events"));

  // Login
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    console.error("DISCORD_TOKEN not set! Please define it in environment variables.");
    return;
  }
  client.login(token).catch(console.error);
})();