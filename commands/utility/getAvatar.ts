import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js"
import type { SlashCommand } from "../../utils/types"

export const getAvatar: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Get the avatar of a user")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Input the user that you wanna fetch the avatar")
    ),
  aliases: ["ga"],

  async execute(context) {
    const executor = context instanceof ChatInputCommandInteraction ? context?.user : context?.author
    let targetUser

    if (context instanceof ChatInputCommandInteraction) {
      targetUser = context?.options?.getUser("user") || context?.user
    } else {
      targetUser = context?.mentions?.users?.first() || context?.author
    }

    const embed = new EmbedBuilder()
      .setTitle("User Avatar")
      .setImage(targetUser?.displayAvatarURL({ extension: "png", size: 1024 }) || executor?.displayAvatarURL({ extension: "png", size: 1024 }))
      .setColor("Blue")
      .setFooter({ iconURL: executor?.displayAvatarURL(), text: `Req by ${executor?.username}` })
      .setTimestamp()

    return await context?.reply({ embeds: [embed] })
  },
}
