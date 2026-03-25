import { EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { SlashCommand } from "../utils/types"

interface ApiData {
  data: {
    mal_id: number
    images?: {
      jpg: {
        image_url: string
      },
      webp: {
        image_url: string
      }
    }
    name: string
    name_kanji: string
    nicknames: string[]
    favorites: number
  }[]
}
type CharOrigin = {
  data: {
    anime: {
      anime: {
        title: string
      }
    }[]
  }
}

const getCharOrigin = async (id: number) => {
  if (id < 0) {
    return
  }

  const data = await fetch(`https://api.jikan.moe/v4/characters/${encodeURIComponent(id)}/full`)

  if (data.status !== 200) {
    console.error(`Error occured when fetching data`)
  }

  const json = await data.json() as CharOrigin

  return json
}
const getAnimeChar = async (char: string) => {
  const data = await fetch(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(char)}`)

  if (data.status !== 200) {
    console.error(`Error occured when fetching data`)
  }

  const json = await data.json() as ApiData

  return json
}
export const charSearch: SlashCommand = {
  cooldown: 10,
  data: new SlashCommandBuilder()
    .setName("search-char")
    .setDescription("Search an anime character by name")
    .addStringOption(option =>
      option.setName("char")
        .setDescription("The char name you want to search")
        .setRequired(true)
    ),

  async execute(interaction) {
    const char = interaction.options.getString("char", true).toLowerCase()
    await interaction.deferReply()

    try {
      const animeChar = await getAnimeChar(char)

      if (!animeChar?.data || animeChar?.data?.length === 0) {
        return await interaction.editReply(`The char ${char} can not be found`)
      }

      const result = animeChar?.data?.find(data => {
        const query = char.toLowerCase().trim()
        const reversed = query.split(" ").reverse().join(" ")
        const name = data?.name?.toLowerCase() || ""
        const nicknames = data?.nicknames?.map(nick => nick.toLowerCase()) || []
        const nickMatch = nicknames.includes(query)
        const nameMatch = name.includes(query) || name.includes(reversed)

        return nickMatch || nameMatch
      })

      if (!result?.mal_id) return

      const charOrigin = await getCharOrigin(result?.mal_id)
      const user = interaction.user
      const embed = new EmbedBuilder()
        .setTitle("Character Search")
        .addFields(
          {
            name: "🔤  Latin",
            value: result?.name || "Unknown"
          },
          {
            name: "🇯🇵  Japanese",
            value: result?.name_kanji || "Unknown"
          },
          {
            name: "⭐  Favorites",
            value: result?.favorites?.toString() || "N/A"
          },
          {
            name: "📍  Origin",
            value: charOrigin?.data?.anime[0]?.anime.title || "Unknown"
          }
        )
        .setImage(result?.images?.jpg?.image_url || result?.images?.webp?.image_url || "")
        .setColor("Blue")
        .setFooter({ iconURL: user.displayAvatarURL(), text: `Ran by ${user.username}` })
        .setTimestamp()

      return await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      console.error(`Error occured when fetching data: ${error}`)

      return await interaction.editReply({ content: "❌ Api fetching failed, try again later" })
    }
  },
}
