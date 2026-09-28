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

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Render
const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot is online!");
}).listen(PORT, () => {
  console.log(`Web server pornit pe portul ${PORT}`);
});

// /setup
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
      { body: commands }
    );

    console.log("Comanda /setup a fost înregistrată!");
  } catch (error) {
    console.error("Eroare:", error);
  }
}

client.once("ready", async () => {
  console.log(`Botul este online ca ${client.user.tag}!`);
  await registerCommands();
});

client.on("interactionCreate", async (interaction) => {

  // /setup
  if (
    interaction.isChatInputCommand() &&
    interaction.commandName === "setup"
  ) {
    const embed = new EmbedBuilder()
      .setTitle("🎫 Bot Test")
      .setDescription(
        "Bine ai venit!\n\n" +
        "🎫 **Create Ticket** - deschide un ticket\n" +
        "✅ **Verify** - verificare"
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

    await interaction.reply({
      content: "Panoul a fost creat!",
      ephemeral: true
    });

    return;
  }

  // Verify
  if (
    interaction.isButton() &&
    interaction.customId === "verify"
  ) {
    await interaction.reply({
      content: "✅ Verificare reușită! (mod test)",
      ephemeral: true
    });

    return;
  }

  // Create ticket
  if (
    interaction.isButton() &&
    interaction.customId === "create_ticket"
  ) {
    const existing = interaction.guild.channels.cache.find(
      channel =>
        channel.name === `ticket-${interaction.user.id}` &&
        channel.type === ChannelType.GuildText
    );

    if (existing) {
      await interaction.reply({
        content: `Ai deja un ticket: ${existing}`,
        ephemeral: true
      });

      return;
    }

    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.id}`,
      type: ChannelType.GuildText,

      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory
          ]
        }
      ]
    });

    const embed = new EmbedBuilder()
      .setTitle("🎫 Ticket")
      .setDescription(
        `Salut ${interaction.user}!\n\n` +
        "Acesta este ticketul tău de test.\n\n" +
        "Apasă 🔒 pentru a închide ticketul."
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("Închide Ticket")
        .setEmoji("🔒")
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: `${interaction.user}`,
      embeds: [embed],
      components: [row]
    });

    await interaction.reply({
      content: `Ticket creat: ${channel}`,
      ephemeral: true
    });

    return;
  }

  // Close ticket
  if (
    interaction.isButton() &&
    interaction.customId === "close_ticket"
  ) {
    await interaction.reply(
      "🔒 Ticketul se închide în 3 secunde..."
    );

    setTimeout(() => {
      interaction.channel.delete().catch(() => {});
    }, 3000);

    return;
  }
});

client.login(TOKEN);
