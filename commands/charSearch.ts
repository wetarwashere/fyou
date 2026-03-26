import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { SlashCommand } from "../utils/types"
import { getCharOrigin } from "../utils/func"
import { failEmbed } from "../utils/embeds"

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

const getAnimeChar = async (char: string) => {
  const data = await fetch(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(char)}`)

  if (!data.ok) {
    console.error(`Error occured when fetching data`)

    return
  }

  const json = await data.json() as ApiData

  return json
}
export const charSearch: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("search-char")
    .setDescription("Search an anime character by name")
    .addStringOption(option =>
      option.setName("name")
        .setDescription("The char name you want to search")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("origin")
        .setDescription("The movie, anime, etc that char from")
        .setRequired(false)),
  aliases: ["sch"],

  async execute(context, args) {
    const executor = context instanceof ChatInputCommandInteraction ? context?.user : context?.author
    let nameQuery: string | null = null
    let originQuery: string | null = null
    let charOrigin = null;
    let result = null

    if (context instanceof ChatInputCommandInteraction) {
      nameQuery = context?.options?.getString("name", true)
      originQuery = context?.options?.getString("origin", false)
      await context?.deferReply()
    } else {
      if (!args || args?.length === 0) {
        nameQuery = null
        originQuery = null
      } else {
        const fromIndex = args?.findIndex(arg => arg.toLowerCase() === "from")

        if (fromIndex !== -1) {
          nameQuery = args?.slice(0, fromIndex).join(" ")
          originQuery = args?.slice(fromIndex + 1).join(" ")
        } else {
          nameQuery = args?.join(" ")
          originQuery = null
        }
      }
    }

    if (!nameQuery) {
      return context instanceof ChatInputCommandInteraction ? await context?.editReply({ embeds: [failEmbed("Char Searcher", "Provide a char name to be searched", executor)] }) : await context?.reply({ embeds: [failEmbed("Char Searcher", "Provide a char name to be searched", executor)] })
    }

    try {
      const animeChar = await getAnimeChar(nameQuery)

      if (!animeChar?.data || animeChar?.data?.length === 0) {
        return context instanceof ChatInputCommandInteraction ? await context?.editReply({ embeds: [failEmbed("Char Searcher", `The char **${nameQuery}** can not be found`, executor)] }) : await context?.reply({ embeds: [failEmbed("Char Searcher", `The char **${nameQuery}** can not be found`, executor)] })
      }

      for (const data of animeChar?.data || []) {
        const query = nameQuery?.toLowerCase().trim()
        const reversed = query?.split(" ").reverse().join(" ")
        const name = data?.name?.toLowerCase() || ""

        const nickMatch = data?.nicknames?.some(nick => nick.toLowerCase().includes(query))
        const nameMatch = name?.includes(query) || name?.includes(reversed)

        if (!(nickMatch || nameMatch)) continue

        if (originQuery) {
          const origin = await getCharOrigin(data?.mal_id)
          const originMatch = origin?.data?.anime?.some(anime => anime?.anime?.title?.toLowerCase().includes(originQuery.toLowerCase()))

          if (!originMatch) continue

          result = data
          charOrigin = origin
          break
        }

        result = data
        charOrigin = await getCharOrigin(data?.mal_id)
        break
      }

      if (!result) {
        return context instanceof ChatInputCommandInteraction ? await context?.editReply({ embeds: [failEmbed("Char Searcher", `No matched character found for **${nameQuery}**`, executor)] }) : await context?.reply({ embeds: [failEmbed("Char Searcher", `No matched character found for **${nameQuery}**`, executor)] })
      }

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
            name: "📍  From",
            value: charOrigin?.data?.anime[0]?.anime?.title || "Unknown"
          }
        )
        .setImage(result?.images?.jpg?.image_url || result?.images?.webp?.image_url || "")
        .setColor("Blue")
        .setFooter({ iconURL: executor?.displayAvatarURL(), text: `Req by ${executor?.username}` })
        .setTimestamp()

      if (context instanceof ChatInputCommandInteraction) {
        return await context.editReply({ embeds: [embed] })
      } else {
        return await context.reply({ embeds: [embed] })
      }
    } catch (error) {
      console.error(`Error occured when fetching data: ${error}`)
      return context instanceof ChatInputCommandInteraction ? await context?.editReply({ embeds: [failEmbed("Char Searcher", "Api fetching failed, try again later", executor)] }) : await context?.reply({ embeds: [failEmbed("Char Searcher", "Api fetching failed, try again later", executor)] })
    }
  },
}
