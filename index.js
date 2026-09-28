const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} = require("discord.js");

const http = require("http");

// =========================
// CONFIG
// =========================

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// =========================
// WEB SERVER - pentru Render
// =========================

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Botul este online!");
}).listen(PORT, () => {
  console.log(`Web server pornit pe portul ${PORT}`);
});

// =========================
// DISCORD CLIENT
// =========================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds
  ]
});

// =========================
// COMANDA /setup
// =========================

const commands = [
  new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Afișează panoul de Ticket și Verify")
    .toJSON()
];

// =========================
// BOT READY
// =========================

client.once("ready", async () => {
  console.log(`Botul este online ca ${client.user.tag}!`);

  try {
    console.log("Înregistrez comanda /setup...");

    const rest = new REST({ version: "10" }).setToken(TOKEN);

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      {
        body: commands
      }
    );

    console.log("Comanda /setup a fost înregistrată!");
  } catch (error) {
    console.error("Eroare la înregistrarea comenzii:", error);
  }
});

// =========================
// INTERACTIONS
// =========================

client.on("interactionCreate", async (interaction) => {

  try {

    // =========================
    // /setup
    // =========================

    if (interaction.isChatInputCommand()) {

      if (interaction.commandName === "setup") {

        const embed = new EmbedBuilder()
          .setTitle("🎫 Ticket & Verification")
          .setDescription(
            "Folosește butoanele de mai jos pentru test."
          );

        const buttons = new ActionRowBuilder()
          .addComponents(

            new ButtonBuilder()
              .setCustomId("create_ticket")
              .setLabel("🎫 Creează Ticket")
              .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
              .setCustomId("verify")
              .setLabel("✅ Verificare")
              .setStyle(ButtonStyle.Success)

          );

        // IMPORTANT:
        // Răspundem direct la interaction,
        // nu folosim interaction.channel.send()

        await interaction.reply({
          embeds: [embed],
          components: [buttons]
        });

        console.log(
          `/setup folosit de ${interaction.user.tag}`
        );

        return;
      }
    }

    // =========================
    // BUTOANE
    // =========================

    if (interaction.isButton()) {

      // =========================
      // VERIFY
      // =========================

      if (interaction.customId === "verify") {

        await interaction.reply({
          content: "✅ Verificare reușită! (mod test)",
          ephemeral: true
        });

        console.log(
          `${interaction.user.tag} a apăsat Verify.`
        );

        return;
      }

      // =========================
      // CREATE TICKET
      // =========================

      if (interaction.customId === "create_ticket") {

        if (!interaction.guild) {
          await interaction.reply({
            content: "❌ Ticket-ul poate fi creat doar pe server.",
            ephemeral: true
          });
          return;
        }

        await interaction.deferReply({
          ephemeral: true
        });

        const channel = await interaction.guild.channels.create({
          name: `ticket-${interaction.user.username}`,
          type: 0, // GuildText

          permissionOverwrites: [

            {
              id: interaction.guild.roles.everyone.id,

              deny: [
                PermissionsBitField.Flags.ViewChannel
              ]
            },

            {
              id: interaction.user.id,

              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory
              ]
            },

            {
              id: client.user.id,

              allow: [
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.ManageChannels
              ]
            }

          ]
        });

        const ticketEmbed = new EmbedBuilder()
          .setTitle("🎫 Ticket")
          .setDescription(
            `Salut ${interaction.user}!\n\nAcesta este ticket-ul tău de test.`
          );

        const closeButton = new ActionRowBuilder()
          .addComponents(

            new ButtonBuilder()
              .setCustomId("close_ticket")
              .setLabel("🔒 Închide Ticket")
              .setStyle(ButtonStyle.Danger)

          );

        await channel.send({
          content: `${interaction.user}`,
          embeds: [ticketEmbed],
          components: [closeButton]
        });

        await interaction.editReply({
          content: `✅ Ticket creat: ${channel}`
        });

        console.log(
          `Ticket creat pentru ${interaction.user.tag}`
        );

        return;
      }

      // =========================
      // CLOSE TICKET
      // =========================

      if (interaction.customId === "close_ticket") {

        await interaction.reply({
          content: "🔒 Ticket-ul se închide...",
          ephemeral: true
        });

        console.log(
          `Ticket închis de ${interaction.user.tag}`
        );

        setTimeout(async () => {

          try {

            if (interaction.channel) {
              await interaction.channel.delete();
            }

          } catch (error) {

            console.error(
              "Nu am putut șterge ticket-ul:",
              error
            );

          }

        }, 2000);

        return;
      }
    }

  } catch (error) {

    console.error(
      "Eroare la interaction:",
      error
    );

    try {

      if (interaction.replied || interaction.deferred) {

        await interaction.followUp({
          content: "❌ A apărut o eroare. Verifică logurile Render.",
          ephemeral: true
        });

      } else {

        await interaction.reply({
          content: "❌ A apărut o eroare. Verifică logurile Render.",
          ephemeral: true
        });

      }

    } catch (replyError) {

      console.error(
        "Nu am putut trimite mesajul de eroare:",
        replyError
      );

    }
  }
});

// =========================
// ERORI CLIENT
// =========================

client.on("error", (error) => {
  console.error("Discord client error:", error);
});

// =========================
// LOGIN
// =========================

client.login(TOKEN);
