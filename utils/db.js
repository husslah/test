// utils/db.js
const mongoose = require("mongoose");
const GuildConfig = require("../models/GuildConfig");

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI not set!");
  // use simpler connect
  await mongoose.connect(uri);
  console.log("MongoDB connected!");
}

async function getGuildConfig(guildId) {
  let config = await GuildConfig.findOne({ guildId });
  if (!config) {
    config = await GuildConfig.create({ guildId });
  }
  return config;
}

module.exports = {
  connectDB,
  getGuildConfig
};