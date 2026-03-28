import { ActionRowBuilder, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder } from "discord.js"
import type { CharData, SlashCommand } from "../utils/types"
import { getAnimeChar, getCharOrigin } from "../utils/func"
import { failEmbed } from "../utils/embeds"

type CharOriginData = {
  char: CharData["data"][number],
  origin: Awaited<ReturnType<typeof getCharOrigin>>
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
    const possibleResults = []
    let nameQuery: string | null = null
    let originQuery: string | null = null

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

        possibleResults?.push(data)

        if (possibleResults?.length >= 100) break
      }

      if (possibleResults.length === 0) {
        return context instanceof ChatInputCommandInteraction ? await context?.editReply({ embeds: [failEmbed("Char Searcher", `No matched character found for **${nameQuery}**`, executor)] }) : await context?.reply({ embeds: [failEmbed("Char Searcher", `No matched character found for **${nameQuery}**`, executor)] })
      }

      const charWithOrigins: CharOriginData[] = []

      for (const char of possibleResults) {
        const origin = await getCharOrigin(char?.mal_id)
        const title = origin?.data?.anime?.[0]?.anime?.title

        if (!title) continue

        charWithOrigins?.push({
          char,
          origin
        })
      }

      if (charWithOrigins?.length === 0) return context instanceof ChatInputCommandInteraction ? await context?.editReply({ embeds: [failEmbed("Char Searcher", `No matched character found for **${nameQuery}**`, executor)] }) : await context?.reply({ embeds: [failEmbed("Char Searcher", `No matched character found for **${nameQuery}**`, executor)] })

      const result = charWithOrigins[0]?.char

      if (!result) return

      if (charWithOrigins?.length === 1) {
        const { char: result, origin: charOrigin } = charWithOrigins[0]!
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
      }

      const selector = new StringSelectMenuBuilder()
        .setCustomId("possible_chars")
        .setPlaceholder("Select possible characters")
        .addOptions(charWithOrigins?.map(({ char, origin }) => ({
          label: char?.name?.slice(0, 100),
          description: origin?.data?.anime?.[0]?.anime?.title?.slice(0, 100) || "Unknown",
          value: char?.mal_id.toString()
        })))
      const row = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(selector)
      const message = context instanceof ChatInputCommandInteraction ? await context?.editReply({ components: [row] }) : await context?.reply({ components: [row] })

      try {
        const interaction = await message?.awaitMessageComponent({ filter: interaction => interaction?.user?.id === executor?.id, time: 60000 })

        if (!interaction?.isStringSelectMenu()) return

        const selected = interaction?.values[0]
        const result = charWithOrigins?.find(({ char }) => char?.mal_id?.toString() === selected)?.char

        if (!result) return

        const charOrigin = await getCharOrigin(result?.mal_id)
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

        return await interaction?.update({ embeds: [embed], components: [] })
      } catch {
        return await message?.edit({ embeds: [failEmbed("Char Searcher", "Interaction timeout", executor)], components: [] })
      }
    } catch (error) {
      console.error(`Error occured when fetching data: ${error}`)
      return context instanceof ChatInputCommandInteraction ? await context?.editReply({ embeds: [failEmbed("Char Searcher", "Api fetching failed, try again later", executor)] }) : await context?.reply({ embeds: [failEmbed("Char Searcher", "Api fetching failed, try again later", executor)] })
    }
  },
}
