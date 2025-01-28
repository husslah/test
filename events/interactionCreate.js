// events/interactionCreate.js
module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;
    const command = client.slashCommands.get(interaction.commandName);
    if (!command) {
      return interaction.reply({ content: "Command not found.", ephemeral: true });
    }
    try {
      await command.execute(interaction, client);
    } catch (err) {
      console.error(err);
      if (interaction.replied || interaction.deferred) {
        interaction.followUp({ content: "❌ Error executing command.", ephemeral: true });
      } else {
        interaction.reply({ content: "❌ Error executing command.", ephemeral: true });
      }
    }
  },
};