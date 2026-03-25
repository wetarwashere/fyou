import { EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { SlashCommand } from "../utils/types"

interface ApiData {
  data: {
    word: string,
    lema: string,
    arti: { deskripsi: string }[]
  }[]
}

const getWordData = async (input: string) => {
  const data = await fetch(`https://openapi.x-labs.my.id/kbbi/search/${encodeURIComponent(input)}`)

  if (data.status !== 200) {
    console.error(`Error occured when fetching data`)
  }

  const json = await data.json() as ApiData

  return json
}
export const kbbi: SlashCommand = {
  cooldown: 6,
  data: new SlashCommandBuilder().setName("kbbi").setDescription("Search a word for its definition in the kbbi").addStringOption(option =>
    option.setName("word")
      .setDescription("The word that you want to find")
      .setRequired(true)
  ),

  async execute(interaction) {
    const word = interaction.options.getString("word", true).toLowerCase()
    await interaction.deferReply()

    try {
      const wordData = await getWordData(word)

      if (!wordData?.data || wordData?.data?.length === 0) {
        return await interaction.editReply(`The word ${word} can not be found!`)
      }

      const datas = wordData?.data
      const user = interaction.user
      const embed = new EmbedBuilder()
        .setTitle("KBBI Searcher")
        .addFields(
          {
            name: "🔤  Word",
            value: word.charAt(0).toUpperCase() + word.slice(1)
          },
          {
            name: "🗣️  Lema",
            value: datas[0]?.lema.replace(/\d+$/g, "") || "Unknown"
          },
          {
            name: "📖  Definition",
            value: datas[0]?.arti.map((arti, index) => `${index + 1}. ${arti.deskripsi}`).join("\n") || "Unknown"
          }
        )
        .setColor("Blue")
        .setFooter({ iconURL: user.displayAvatarURL(), text: `Req by ${user.username}` })
        .setTimestamp()

      return await interaction.editReply({ embeds: [embed] })
    } catch (error) {
      console.error(`Error occured when fetching data: ${error}`)

      return await interaction.editReply({ content: "❌ Api fetching failed, try again later" })
    }
  },
}
