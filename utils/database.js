const mongoose = require("mongoose");
const GuildConfig = require("../models/GuildConfig");

// Load environment variables
require('dotenv').config();

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI not set!");

  try {
    // Establish connection
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1); // Exit the process with failure
  }
}

async function getGuildConfig(guildId) {
  try {
    let config = await GuildConfig.findOne({ guildId });
    if (!config) {
      config = await GuildConfig.create({ guildId });
    }
    return config;
  } catch (error) {
    console.error("Error retrieving or creating GuildConfig:", error.message);
    throw error;
  }
}

module.exports = {
  connectDB,
  getGuildConfig,
};
