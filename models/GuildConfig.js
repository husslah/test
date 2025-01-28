// models/GuildConfig.js
const { Schema, model } = require("mongoose");

const guildConfigSchema = new Schema({
  guildId: { type: String, required: true, unique: true },

  admins: { type: [String], default: [] },
  whitelist: { type: [String], default: [] },

  prefix: { type: String, default: "." },

  modules: {
    channel: {
      enabled: { type: Boolean, default: false },
      threshold: { type: Number, default: 3 },
      punishment: { type: String, default: "ban" },
      actions: { type: Map, of: Number, default: {} },
    },
    role: {
      enabled: { type: Boolean, default: false },
      threshold: { type: Number, default: 3 },
      punishment: { type: String, default: "jail" },
      actions: { type: Map, of: Number, default: {} },
    },
    emoji: {
      enabled: { type: Boolean, default: false },
      threshold: { type: Number, default: 3 },
      punishment: { type: String, default: "ban" },
      actions: { type: Map, of: Number, default: {} },
    },
    ban: {
      enabled: { type: Boolean, default: false },
      threshold: { type: Number, default: 3 },
      punishment: { type: String, default: "stripstaff" },
      actions: { type: Map, of: Number, default: {} },
    },
    kick: {
      enabled: { type: Boolean, default: false },
      threshold: { type: Number, default: 3 },
      punishment: { type: String, default: "ban" },
      actions: { type: Map, of: Number, default: {} },
    },
    webhook: {
      enabled: { type: Boolean, default: false },
      threshold: { type: Number, default: 2 },
      punishment: { type: String, default: "jail" },
      actions: { type: Map, of: Number, default: {} },
    },
    vanity: {
      enabled: { type: Boolean, default: false },
      punishment: { type: String, default: "stripstaff" },
    },
    botadd: {
      enabled: { type: Boolean, default: false },
    },
    permissions: {
      enabled: { type: Boolean, default: false },
      permission: { type: String, default: "administrator" },
      punishment: { type: String, default: "ban" },
    },

    // mass creation
    channelcreate: {
      enabled: { type: Boolean, default: false },
      threshold: { type: Number, default: 3 },
      punishment: { type: String, default: "ban" },
      actions: { type: Map, of: Number, default: {} },
    },
    rolecreate: {
      enabled: { type: Boolean, default: false },
      threshold: { type: Number, default: 3 },
      punishment: { type: String, default: "ban" },
      actions: { type: Map, of: Number, default: {} },
    },

    // mass mention
    massmention: {
      enabled: { type: Boolean, default: false },
      threshold: { type: Number, default: 5 },
      punishment: { type: String, default: "kick" },
    },
  }
});

module.exports = model("GuildConfig", guildConfigSchema);