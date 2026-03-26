import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"
import type { SlashCommand } from "../../utils/types"
import { commands } from "../../utils/func"
import config from "../../config.json"
import db from "../../utils/db"
import { failEmbed, successEmbed } from "../../utils/embeds"

export const setCooldown: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName("set-cooldown")
    .setDescription("Set the cooldown of a command by the given number")
    .addStringOption(option =>
      option.setName("command")
        .setDescription("Command that you wanna change")
        .setRequired(true)
        .addChoices(Array.from(commands.values()).sort((frst, scnd) => frst?.data?.name?.localeCompare(scnd?.data?.name)).map(command => ({ name: command?.data?.name, value: command?.data?.name })))
    )
    .addIntegerOption(option =>
      option.setName("value")
        .setDescription("Cooldown duration")
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(100)
    ),
  aliases: ["sc"],

  async execute(context, args) {
    const executor = context instanceof ChatInputCommandInteraction ? context?.user : context?.author

    if (executor?.id !== config.ownerId) {
      return await context?.reply({ embeds: [failEmbed("Set Cooldown", "This command is exclusive to the owner, you can not use it", executor)] })
    }

    let targetName: string | null = null
    let value: number | null = null

    if (context instanceof ChatInputCommandInteraction) {
      targetName = context?.options?.getString("command", true).toLowerCase()
      value = context?.options?.getInteger("value", true)
    } else {
      targetName = args?.[0]?.toLowerCase() || null
      value = parseInt(args?.[1] || "") || null
    }

    if (!targetName || value === null) {
      return await context?.reply({ embeds: [failEmbed("Set Cooldown", "Wrong format, use `!set-cooldown avatar 10` for example", executor)] })
    }

    const commandData = commands?.get(targetName)

    if (!commandData) {
      return await context?.reply({ embeds: [failEmbed("Set Cooldown", `Command ${targetName} doesn't exist`, executor)] })
    }

    try {
      await db.execute("INSERT INTO commandSettings (commandName, cooldown) VALUES (?, ?) ON DUPLICATE KEY UPDATE cooldown = VALUES(cooldown)", [targetName, value])

      commandData.cooldown = value

      return await context?.reply({ embeds: [successEmbed("Set Cooldown", `Command **${commandData?.data?.name}** cooldown successfully changed to ${value} second/s`, executor)] })
    } catch (error) {
      console.error(error)

      if (context instanceof ChatInputCommandInteraction && (context?.replied || context?.deferred)) {
        return await context?.followUp({ embeds: [failEmbed("Set Cooldown", "Something bad occured when trying to run this command", executor)] })
      } else {
        return await context?.reply({ embeds: [failEmbed("Set Cooldown", "Something bad occured when trying to run this command", executor)] })
      }
    }
  },
}
