import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { SlashCommand } from "../utils/types"
import { failEmbed } from "../utils/embeds"

type MeaningsType = {
  partOfSpeech: string,
  definitions: { definition: string }[]
}

interface ApiData {
  word: string,
  phonetic: string,
  meanings: MeaningsType[]
}

const getWordFromDict = async (word: string) => {
  const data = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)

  if (!data.ok) {
    console.error(`Error occured when fetching data`)

    return
  }

  const json = await data.json() as ApiData[]

  return json
}
export const dictionary: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("dictionary")
    .setDescription("Get a word from english dictionary")
    .addStringOption(option =>
      option.setName("word")
        .setDescription("The word that you want to find")
        .setRequired(true)
    ),
  aliases: ["dic", "dn"],

  async execute(context, args) {
    const executor = context instanceof ChatInputCommandInteraction ? context?.user : context?.author
    let wordQuery: string | null = null;

    if (context instanceof ChatInputCommandInteraction) {
      wordQuery = context?.options?.getString("word", true).toLowerCase()

      await context?.deferReply()
    } else {
      wordQuery = args?.join(" ") || null
    }

    if (!wordQuery) {
      return context instanceof ChatInputCommandInteraction ? await context?.editReply({
        embeds: [failEmbed("Char Searcher", "Give a word to be searched", executor)]
      }) : await context?.reply({ embeds: [failEmbed("Char Searcher", "Give a word to be searched", executor)] })
    }

    try {
      const wordData = await getWordFromDict(wordQuery)

      if (!wordData || wordData.length === 0) {
        return context instanceof ChatInputCommandInteraction ? await context?.editReply({ embeds: [failEmbed("Dictionary Searcher", `The word **${wordQuery}** can not be found!`, executor)] }) : await context?.reply({ embeds: [failEmbed("Dictionary Searcher", `The word **${wordQuery}** can not be found!`, executor)] })
      }

      const data = wordData[0]
      const embed = new EmbedBuilder()
        .setTitle("Dictionary Searcher")
        .addFields(
          {
            name: "🔤  Word",
            value: wordQuery.charAt(0).toUpperCase() + wordQuery.slice(1)
          },
          {
            name: "🗣️  Phonetic",
            value: `${data?.phonetic || "Unknown"}`
          },
          {
            name: "📖  Definition",
            value: data?.meanings?.map((meaning, index) => `${index + 1}. **${meaning.partOfSpeech}** ${meaning.definitions.map(defs => defs.definition)}`).join("\n") || "Unknown"
          }
        )
        .setColor("Blue")
        .setFooter({ iconURL: executor?.displayAvatarURL(), text: `Req by ${executor?.username}` })
        .setTimestamp()

      return context instanceof ChatInputCommandInteraction ? await context?.editReply({ embeds: [embed] }) : await context?.reply({ embeds: [embed] })
    } catch (error) {
      console.error(`Error occured when fetching data: ${error}`)

      return context instanceof ChatInputCommandInteraction ? await context?.editReply({ embeds: [failEmbed("Dictionary Searcher", "Api fetching failed, try again later", executor)] }) : await context?.reply({ embeds: [failEmbed("Dictionary Searcher", "Api fetching failed, try again later", executor)] })
    }
  },
}
