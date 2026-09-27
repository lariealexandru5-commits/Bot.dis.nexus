const { Client, GatewayIntentBits } = require("discord.js");
const http = require("http");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Port pentru Render
const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot is online!");
}).listen(PORT, () => {
  console.log(`Web server pornit pe portul ${PORT}`);
});

client.once("ready", () => {
  console.log(`Botul este online ca ${client.user.tag}!`);
});

client.login(process.env.TOKEN);
