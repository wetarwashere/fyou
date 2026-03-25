import { EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { SlashCommand } from "../../utils/types"

export const ping: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Get both the bot and api latency"),

  async execute(interaction) {
    await interaction.deferReply()

    const replyMessage = await interaction.fetchReply()
    const roundTripLatency = replyMessage.createdTimestamp - interaction.createdTimestamp
    const apiLatency = interaction.client.ws.ping < 0 ? "0" : Math.round(interaction.client.ws.ping)
    const user = interaction.user
    const embed = new EmbedBuilder()
      .setTitle("Latency Checker")
      .setFields(
        {
          name: "🏓  Api",
          value: apiLatency.toString() + "ms"
        },
        {
          name: "🤖  Bot",
          value: roundTripLatency.toString() + "ms"
        }
      )
      .setColor("Blue")
      .setFooter({ iconURL: user.displayAvatarURL(), text: `Ran by ${user.username}` })
      .setTimestamp()

    await interaction.editReply({ embeds: [embed] })
  },
}
