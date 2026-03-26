import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { SlashCommand } from "../utils/types"
import { failEmbed } from "../utils/embeds"

interface ApiData {
  data: {
    word: string,
    lema: string,
    arti: { deskripsi: string }[]
  }[]
}

const getWordData = async (input: string) => {
  const data = await fetch(`https://openapi.x-labs.my.id/kbbi/search/${encodeURIComponent(input)}`)

  if (!data.ok) {
    console.error(`Error occured when fetching data`)

    return
  }

  const json = await data.json() as ApiData

  return json
}
export const kbbi: SlashCommand = {
  data: new SlashCommandBuilder().setName("kbbi").setDescription("Search a word for its definition in the kbbi").addStringOption(option =>
    option.setName("word")
      .setDescription("The word that you want to find")
      .setRequired(true)
  ),

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
      const wordData = await getWordData(wordQuery)

      if (!wordData || wordData.data.length === 0) {
        return context instanceof ChatInputCommandInteraction ? await context?.editReply({ embeds: [failEmbed("Dictionary Searcher", `The word **${wordQuery}** can not be found!`, executor)] }) : await context?.reply({ embeds: [failEmbed("Dictionary Searcher", `The word **${wordQuery}** can not be found!`, executor)] })
      }

      const datas = wordData?.data
      const embed = new EmbedBuilder()
        .setTitle("KBBI Searcher")
        .addFields(
          {
            name: "🔤  Word",
            value: wordQuery?.charAt(0).toUpperCase() + wordQuery?.slice(1)
          },
          {
            name: "🗣️  Lema",
            value: datas[0]?.lema?.replace(/\d+$/g, "") || "Unknown"
          },
          {
            name: "📖  Definition",
            value: datas[0]?.arti?.map((arti, index) => `${index + 1}. ${arti.deskripsi}`).join("\n") || "Unknown"
          }
        )
        .setColor("Blue")
        .setFooter({ iconURL: executor?.displayAvatarURL(), text: `Req by ${executor?.username}` })
        .setTimestamp()

      if (context instanceof ChatInputCommandInteraction) {
        return await context?.editReply({ embeds: [embed] })
      } else {
        return await context?.reply({ embeds: [embed] })
      }
    } catch (error) {
      console.error(`Error occured when fetching data: ${error}`)

      return context instanceof ChatInputCommandInteraction ? await context?.editReply({ embeds: [failEmbed("Dictionary Searcher", "Api fetching failed, try again later", executor)] }) : await context?.reply({ embeds: [failEmbed("Dictionary Searcher", "Api fetching failed, try again later", executor)] })
    }
  },
}
