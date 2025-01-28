// events/ready.js
module.exports = {
  name: "ready",
  async execute(client) {
    console.log(`Logged in as ${client.user.tag}! i love you`);
    client.user.setActivity("hi.");
  },
};