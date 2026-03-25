import { EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { SlashCommand } from "../../utils/types"
import { commands } from "../../utils/func"
import config from "../../config.json"

export const setCooldown: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("set-cooldown")
    .setDescription("Set the cooldown of a command by the given number")
    .addStringOption(option =>
      option.setName("command")
        .setDescription("Command that you wanna change")
        .setRequired(true)
        .addChoices(
          {
            name: "avatar",
            value: "avatar"
          },
          {
            name: "dictionary",
            value: "dictionary"
          },
          {
            name: "help",
            value: "help"
          },
          {
            name: "kbbi",
            value: "kbbi"
          },
          {
            name: "ping",
            value: "ping"
          },
          {
            name: "random-anime",
            value: "random-anime"
          },
          {
            name: "search-char",
            value: "search-char"
          },
        )
    )
    .addIntegerOption(option =>
      option.setName("value")
        .setDescription("Cooldown duration")
        .setRequired(true)
        .setMinValue(0)
    ),

  async execute(interaction) {
    const target = interaction.options.getString("command", true).toLowerCase()
    const value = interaction.options.getInteger("value", true)
    const command = commands.get(target)
    const embed = new EmbedBuilder()
      .setTitle("Cooldown Changer")
      .setColor("Blue")
      .addFields(
        {
          name: "✅  Status",
          value: `The command ${command?.data?.name} cooldown successfully changed to ${value} second/s`
        }
      )
      .setFooter({ iconURL: interaction.user.displayAvatarURL(), text: `Ran by ${interaction.user.username}` })
      .setTimestamp()

    if (!command) {
      return await interaction.reply({ content: `❌ The given command does not exist` })
    } else if (interaction.user.id !== config.ownerId) {
      return await interaction.reply({ content: `❌ This command is exclusive to the owner, you can not use it` })
    }

    command.cooldown = value

    return await interaction.reply({ embeds: [embed] })
  },
}
