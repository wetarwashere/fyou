import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import type { SlashCommand } from "../../utils/types"
import config from "../../config.json"
import db from "../../utils/db"
import { failEmbed, successEmbed } from "../../utils/embeds"

export const setPrefix: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("set-prefix")
    .setDescription("Set the bot prefix")
    .addStringOption(option =>
      option.setName("prefix")
        .setDescription("The new prefix to be set")
        .setRequired(true)
    )
    .addBooleanOption(option =>
      option.setName("current")
        .setDescription("Show current prefix instead")
        .setRequired(false)),
  aliases: ["sp"],

  async execute(context, args) {
    const executor = context instanceof ChatInputCommandInteraction ? context?.user : context?.author

    if (executor?.id !== config.ownerId) {
      return await context?.reply({ embeds: [failEmbed("Set Prefix", "This command is exclusive to the owner, you can not use it", executor)] })
    }

    let newPrefix: string | null = null

    if (context instanceof ChatInputCommandInteraction) {
      newPrefix = context?.options?.getString("prefix", true)
    } else {
      newPrefix = args?.[0] || null
    }

    if (!newPrefix) {
      return context?.reply({ embeds: [failEmbed("Set Prefix", "Provide a new prefix to be set", executor)] })
    }

    try {
      await db.execute("INSERT INTO guildSettings (guildId, prefix) VALUES (?, ?) ON DUPLICATE KEY UPDATE prefix = VALUES(prefix)", [context?.guildId, newPrefix])

      return await context?.reply({ embeds: [successEmbed("Set Prefix", `Prefix set to **${newPrefix}** successfully`, executor)] })
    } catch (error) {
      console.error(error)

      return await context?.reply({ embeds: [failEmbed("Set Prefix", "Failed to set prefix", executor)] })
    }
  },
}
