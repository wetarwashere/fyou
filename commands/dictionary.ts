import { EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { SlashCommand } from "../utils/types"

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

  if (data.status !== 200) {
    console.error(`Error occured when fetching data`)
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

  async execute(interaction) {
    const word = interaction.options.getString("word", true).toLowerCase()
    await interaction.deferReply()

    try {
      const wordData = await getWordFromDict(word)

      if (!wordData || wordData.length === 0) {
        return await interaction.editReply(`The word ${word} can not be found!`)
      }

      const data = wordData[0]
      const user = interaction.user
      const embed = new EmbedBuilder()
        .setTitle("Dictionary Finder")
        .addFields(
          {
            name: "🔤  Word",
            value: word.charAt(0).toUpperCase() + word.slice(1)
          },
          {
            name: "🗣️  Phonetic",
            value: `${data?.phonetic || "Unknown"}`
          },
          {
            name: "📖  Definition",
            value: data?.meanings.map((meaning, index) => `${index + 1}. **${meaning.partOfSpeech}** ${meaning.definitions.map(defs => defs.definition)}`).join("\n") || "Unknown"
          }
        )
        .setColor("Blue")
        .setFooter({ iconURL: user.displayAvatarURL(), text: `Req by ${user.username}` })
        .setTimestamp()

      await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      console.error(`Error occured when fetching data: ${error}`)

      return await interaction.editReply({ content: "❌ Api fetching failed, try again later" })
    }
  },
}
