const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const http = require("http");

// =========================
// CONFIG
// =========================

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// =========================
// RENDER WEB SERVER
// =========================

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot is online!");
}).listen(PORT, () => {
  console.log(`Web server pornit pe portul ${PORT}`);
});

// =========================
// REGISTER /SETUP
// =========================

async function registerCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName("setup")
      .setDescription("Afișează panoul de Ticket și Verify")
      .toJSON()
  ];

  const rest = new REST({ version: "10" }).setToken(TOKEN);

  try {
    console.log("Înregistrez comanda /setup...");

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      {
        body: commands
      }
    );

    console.log("Comanda /setup a fost înregistrată! ✅");
  } catch (error) {
    console.error("Eroare la înregistrarea comenzii:", error);
  }
}

// =========================
// BOT READY
// =========================

client.once("ready", async () => {
  console.log(`Botul este online ca ${client.user.tag}!`);

  await registerCommands();
});

// =========================
// INTERACTIONS
// =========================

client.on("interactionCreate", async
