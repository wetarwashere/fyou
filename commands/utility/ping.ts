import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { SlashCommand } from "../../utils/types"
import { successEmbed } from "../../utils/embeds";

export const ping: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Get both the bot and api latency"),

  async execute(context) {
    const executor = context instanceof ChatInputCommandInteraction ? context?.user : context?.author
    let replyMessage = null;

    if (context instanceof ChatInputCommandInteraction) {
      await context.deferReply()
      replyMessage = await context.fetchReply()
    } else {
      replyMessage = await context.reply({ embeds: [successEmbed("Bot Status", "Checking......", executor, "⏰")] })
    }

    const roundTripLatency = replyMessage.createdTimestamp - context?.createdTimestamp
    const apiLatency = context?.client.ws.ping < 0 ? "0" : Math.round(context?.client.ws.ping)
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
      .setFooter({ iconURL: executor?.displayAvatarURL(), text: `Ran by ${executor?.username}` })
      .setTimestamp()

    if (context instanceof ChatInputCommandInteraction) {
      return await context?.editReply({ embeds: [embed] })
    } else {
      return await replyMessage.edit({ embeds: [embed] })
    }
  },
}
