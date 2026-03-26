import { EmbedBuilder, User } from "discord.js";

export const failEmbed = (title: string, message: string, executor: User, icon?: string) => {
  return new EmbedBuilder()
    .setColor("Red")
    .setTitle(title)
    .setFields(
      {
        name: `${icon || "❌"}  Details`,
        value: message
      }
    )
    .setFooter({ iconURL: executor?.displayAvatarURL(), text: `Req by ${executor?.username}` })
    .setTimestamp()
}
export const successEmbed = (title: string, message: string, executor: User, icon: string) => {
  return new EmbedBuilder()
    .setColor("Blue")
    .setTitle(title)
    .setFields(
      {
        name: `${icon || "✅"}  Details`,
        value: message
      }
    )
    .setFooter({ iconURL: executor?.displayAvatarURL(), text: `Req by ${executor?.username}` })
    .setTimestamp()
}
