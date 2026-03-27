import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { SlashCommand } from "../utils/types"
import { failEmbed } from "../utils/embeds"
import { getRandomAnime } from "../utils/func"

export const randomAnime: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("random-anime")
    .setDescription("Get random anime, powered by jikan api"),
  aliases: ["ra"],

  async execute(context) {
    const executor = context instanceof ChatInputCommandInteraction ? context?.user : context?.author

    if (context instanceof ChatInputCommandInteraction) await context?.deferReply()

    try {
      const animeData = await getRandomAnime()

      if (!animeData) {
        return context instanceof ChatInputCommandInteraction ? await context?.editReply({ embeds: [failEmbed("Reqdom Anime", "Failed to fetch random anime", executor)] }) : await context?.reply({ embeds: [failEmbed("Random Anime", "Failed to fetch random anime", executor)] })
      }

      const { data } = animeData
      const embed = new EmbedBuilder()
        .setTitle("Reqdom Anime")
        .addFields(
          {
            name: "🇬🇧  English",
            value: data?.title_english || "Unknown",
          },
          {
            name: "🔤  Romaji",
            value: data?.title || "Unknown",
          },
          {
            name: "🇯🇵  Japanese",
            value: data?.title_japanese || "Unknown",
          },
          {
            name: "🍫  Genres",
            value: data?.genres?.slice(0, 3).map(genre => genre.name).join(", ") || "Unknown",
            inline: true
          },
          {
            name: "⭐ Rating",
            value: `${data?.score || "N/A"} by ${data?.scored_by || "N/A"} people`,
          },
        )
        .setImage(data?.images?.jpg?.image_url || data?.images?.webp?.image_url || "")
        .setColor("Blue")
        .setFooter({ iconURL: executor?.displayAvatarURL(), text: `Req by ${executor?.username}` })
        .setTimestamp()

      if (context instanceof ChatInputCommandInteraction) {
        return await context?.editReply({ embeds: [embed] })
      } else {
        return await context?.reply({ embeds: [embed] })
      }
    } catch (error) {
      console.error(`Error occured when fetching data ${error}`)

      return context instanceof ChatInputCommandInteraction ? await context?.editReply({ embeds: [failEmbed("Dictionary Searcher", "Api fetching failed, try again later", executor)] }) : await context?.reply({ embeds: [failEmbed("Dictionary Searcher", "Api fetching failed, try again later", executor)] })
    }
  }
}
