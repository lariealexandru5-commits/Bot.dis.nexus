const {
  Client,
  GatewayIntentBits,
  ChannelType,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

const http = require("http");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Server pentru Render
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

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand() && !interaction.isButton()) return;

  // /setup
  if (interaction.isChatInputCommand() && interaction.commandName === "setup") {
    const embed = new EmbedBuilder()
      .setTitle("🎫 Bot Test")
      .setDescription(
        "Bine ai venit!\n\n" +
        "🎫 Apasă **Create Ticket** pentru a deschide un ticket.\n" +
        "✅ Apasă **Verify** pentru verificare."
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("create_ticket")
        .setLabel("Create Ticket")
        .setEmoji("🎫")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("verify")
        .setLabel("Verify")
        .setEmoji("✅")
        .setStyle(ButtonStyle.Success)
    );

    await interaction.channel.send({
      embeds: [embed],
      components: [row]
    });

    return interaction.reply({
      content: "Panoul a fost creat! ✅",
      ephemeral: true
    });
  }

  //
