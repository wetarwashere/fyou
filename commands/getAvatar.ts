import { EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { SlashCommand } from "../utils/types"

export const getAvatar: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Get the avatar of a user")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Input the user that you wanna fetch the avatar")
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user", true)
    const embed = new EmbedBuilder()
      .setTitle("User Avatar")
      .setImage(user?.displayAvatarURL({ extension: "png", forceStatic: true, size: 1024 }))
      .setColor("Blue")
      .setFooter({ iconURL: interaction.user.displayAvatarURL(), text: `Ran by ${interaction.user.username}` })
      .setTimestamp()

    await interaction.reply({ embeds: [embed] })
  },
}
