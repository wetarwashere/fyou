import { EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { SlashCommand } from "../utils/types"

type ApiData = {
  data: {
    url: string,
    images?: {
      jpg: {
        image_url: string
      },
      webp: {
        image_url: string
      }
    }
    title: string,
    title_english?: string,
    title_japanese: string,
    score: number,
    scored_by: number,
    genres: { mal_id: number, name: string, url: string }[]
  }
}

const getRandomAnime = async () => {
  const data = await fetch("https://api.jikan.moe/v4/random/anime")

  if (data.status !== 200) {
    console.error(`Error occured when fetching data`)
  }

  const json = await data.json() as ApiData

  return json
}
export const randomAnime: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("random-anime")
    .setDescription("Get random anime, powered by jikan api"),

  async execute(interaction) {
    await interaction.deferReply()

    try {
      const anime = await getRandomAnime()
      const { data } = anime
      const user = interaction.user
      const embed = new EmbedBuilder()
        .setTitle("Random Anime")
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
        .setFooter({ iconURL: user.displayAvatarURL(), text: `Ran by ${user.username}` })
        .setTimestamp()

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      console.error(`Error occured when fetching data ${error}`)

      return await interaction.editReply({ content: "❌ Api fetching failed, try again later" })
    }
  }
}
