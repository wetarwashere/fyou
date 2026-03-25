import { EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { SlashCommand } from "../../utils/types"

export const help: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Open the bot's help menu"),

  async execute(interaction) {
    const user = interaction.user
    const embed = new EmbedBuilder()
      .setTitle("Help Menu")
      .addFields(
        {
          name: "🔧  Utility",
          value: "`/help` - To open this menu\n`/ping` - To check the bot and api latency\n`/avatar` - To get the avatar of a user"
        },
        {
          name: "🍿  Searcher",
          value: "`/dictionary` - For searching the definition of an english word\n`/search-char` - For searching a character by name (anime,movie,etc)\n`/kbbi` - For searching the definition of an indonesian word"
        },
        {
          name: "🎲  Randomizer",
          value: "`/random-anime` - To get a random anime out of the blue"
        },
        {
          name: "👑  Owner",
          value: "`/change-cooldown` - Change a specific command cooldown"
        }
      )
      .setColor("Blue")
      .setFooter({ iconURL: user.displayAvatarURL(), text: `Ran by ${user.username}` })
      .setTimestamp()

    return await interaction.reply({ embeds: [embed] })
  },
}
