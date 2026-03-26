import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { SlashCommand } from "../../utils/types"

export const help: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Open the bot's help menu"),

  async execute(context) {
    const executor = context instanceof ChatInputCommandInteraction ? context?.user : context?.author
    let targetUser

    if (context instanceof ChatInputCommandInteraction) {
      targetUser = context?.options?.getUser("user") || context?.user
    } else {
      targetUser = context?.mentions?.users?.first() || context?.author
    }

    const embed = new EmbedBuilder()
      .setTitle("Help Menu")
      .addFields(
        {
          name: "🔧  Utility",
          value: "`/help | <prefix>help` - To open this menu\n`/ping | <prefix>ping` - To check the bot and api latency\n`/avatar | <prefix>ga` - To get the avatar of a user"
        },
        {
          name: "🍿  Searcher",
          value: "`/dictionary | <prefix>dic` - For searching the definition of an english word\n`/search-char | <prefix>sch` - For searching a character by name (anime, game, etc)\n`/kbbi` - For searching the definition of an indonesian word"
        },
        {
          name: "🎲  Randomizer",
          value: "`/random-anime | <prefix>ra` - To get a random anime out of the blue\n`/random-char | <prefix>rc` - To get a random character from anime, game, etc out of the blue"
        },
        {
          name: "👑  Owner",
          value: "`/set-cooldown | <prefix>sc` - Change a specific command cooldown\n`/set-prefix | <prefix>sp` - Change the bot prefix"
        }
      )
      .setColor("Blue")
      .setFooter({ iconURL: executor?.displayAvatarURL(), text: `Req by ${executor?.username}` })
      .setTimestamp()

    return await context?.reply({ embeds: [embed] })
  },
}
