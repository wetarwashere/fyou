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
  }
}

const getReqdomCharacter = async () => {
  const data = await fetch("https://api.jikan.moe/v4/random/characters")

  if (!data.ok) {
    console.error(`Error occured when fetching data`)

    return
  }

  const json = await data.json() as ApiData

  return json
}
export const randomChar: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("random-char")
    .setDescription("Get random character from anime, game, etc"),
  aliases: ["rc"],

  async execute(context) {
    const executor = context instanceof ChatInputCommandInteraction ? context?.user : context?.author

    if (context instanceof ChatInputCommandInteraction) await context?.deferReply()

    try {
      const charData = await getReqdomCharacter()

      if (!charData) {
        return context instanceof ChatInputCommandInteraction ? await context?.editReply({ embeds: [failEmbed("Reqdom Char", "Failed to fetch random character", executor)] }) : await context?.reply({ embeds: [failEmbed("Random Char", "Failed to fetch random character", executor)] })
      }

      const { data } = charData
      const charOrigin = await getCharOrigin(data?.mal_id)

      if (!charOrigin) {
        return context instanceof ChatInputCommandInteraction ? await context?.editReply({ embeds: [failEmbed("Reqdom Char", "Failed to fetch character origin", executor)] }) : await context?.reply({ embeds: [failEmbed("Random Char", "Failed to fetch character origin", executor)] })
      }

      const embed = new EmbedBuilder()
        .setTitle("Reqdom Anime")
        .addFields(
          {
            name: "🇬🇧  English",
            value: data?.name || "Unknown",
          },
          {
            name: "🇯🇵  Japanese",
            value: data?.name_kanji || "Unknown",
          },
          {
            name: "🗣️  Nicknames",
            value: data?.nicknames?.slice(0, 3).map(nick => nick).join(", ") || "Unknown",
            inline: true
          },
          {
            name: "⭐ Favorites",
            value: `${data?.favorites || "N/A"}`,
          },
          {
            name: "📍  From",
            value: charOrigin?.data?.anime[0]?.anime.title || "Unknown"
          }
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
  },
}
