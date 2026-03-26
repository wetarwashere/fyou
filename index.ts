import { ActivityType, Events } from "discord.js"
import { client, commands, loadCommands, registerCommand } from "./utils/func"
import config from "./config.json"
import db from "./utils/db"
import type { CooldownRows, GuildSettingsRows, CommandSettingsRows } from "./utils/types"
import { failEmbed } from "./utils/embeds"

client.on(Events.MessageCreate, async (message) => {
  if (message?.author?.bot || !message?.guild) return

  try {
    const [guildSettings] = await db.execute<GuildSettingsRows[]>("SELECT prefix, allowedChannels FROM guildSettings WHERE guildId = ?", [message?.guild?.id])
    const prefix = guildSettings[0]?.prefix ?? "!"
    const globalAllowed = guildSettings[0]?.allowedChannels

    if (globalAllowed) {
      const globalList = globalAllowed?.split(",").map(id => id?.trim())

      if (!globalList.includes(message?.channelId)) return
    }

    if (!message?.content?.startsWith(prefix)) return

    const args = message?.content?.slice(prefix.length).trim().split(/ +/)
    const commandName = args?.shift()?.toLowerCase()

    if (!commandName) return

    const command = commands?.find(command => command?.aliases && command?.aliases?.includes(commandName)) || commands?.get(commandName)

    if (!command) return

    const [commandSettings] = await db.execute<GuildSettingsRows[]>("SELECT allowedChannels FROM commandSettings WHERE commandName = ?", [command?.data?.name])
    const rawText = commandSettings[0]?.allowedChannels

    if (rawText) {
      const allowList = rawText?.split(",").map(id => id?.trim())

      if (!allowList.includes(message.channelId)) {
        return await message.reply({ embeds: [failEmbed("Bot Status", `❌ This command can only be run in these channels ${allowList?.map(channelId => `<#${channelId}>`).join(" ")}`, message?.author)] })
      }
    }

    const now = Date.now()
    const [cooldownRows] = await db.execute<CooldownRows[]>("SELECT lastUsed FROM commandCooldowns WHERE userId = ? AND commandName = ?", [message?.author?.id, command?.data?.name])
    const currentDuration = commandSettings[0]?.cooldown ?? command.cooldown ?? 4
    const cooldownAmount = currentDuration * 1000
    const userData = cooldownRows[0]

    if (userData) {
      const lastUsed = Number(userData?.lastUsed)
      const expired = lastUsed + cooldownAmount

      if (now < expired) {
        const timeLeft = Math.round(expired / 1000)

        return await message?.reply({
          embeds: [failEmbed("Bot Status", `Calm down, you may do it again <t:${timeLeft}:R>`, message?.author, "⏰")]
        })
      }
    }

    await db.execute("INSERT INTO commandCooldowns (userId, commandName, lastUsed) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE lastUsed = VALUES(lastUsed)", [message?.author?.id, command?.data?.name, now])


    return await command?.execute(message, args)
  } catch (error) {
    console.error(error)

    return await message?.reply({ embeds: [failEmbed("Bot Status", "Something bad occured while trying to run this command", message?.author)] })
  }
})

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  const command = commands.get(interaction?.commandName)

  if (!command) {
    console.error(`${interaction?.commandName} is not a valid command`)
  }

  const commandName = command?.data?.name

  if (!commandName) return

  const now = Date.now()

  try {
    const [commandSettings] = await db.execute<CommandSettingsRows[]>("SELECT cooldown, allowedChannels FROM commandSettings WHERE commandName = ?", [command?.data?.name])
    const currentDuration = commandSettings[0]?.cooldown ?? command.cooldown ?? 4
    const cooldownAmount = currentDuration * 1000
    const rawText: string = commandSettings[0]?.allowedChannels

    if (rawText) {
      const allowList = rawText.split(",").map(id => id.trim())

      if (!allowList.includes(interaction?.channelId)) {
        const channelMentions = allowList?.map(channelId => `<#${channelId}>`).join(" ")

        return await interaction?.reply({ embeds: [failEmbed("Bot Status", `This command can only be run in these channels ${channelMentions}`, interaction?.user)] })
      }
    }

    const [cooldownRows] = await db?.execute<CooldownRows[]>("SELECT lastUsed FROM commandCooldowns WHERE userId = ? AND commandName = ?", [interaction?.user?.id, command?.data?.name]);

    const userData = cooldownRows[0]

    if (userData) {
      const lastUsed = Number(userData?.lastUsed)
      const expired = lastUsed + cooldownAmount

      if (now < expired) {
        const timeLeft = Math.round(expired / 1000)

        return await interaction?.reply({ embeds: [failEmbed("Bot Status", `Calm down, you may do it again <t:${timeLeft}:R>`, interaction?.user, "⏰")] })
      }
    }

    await db.execute("INSERT INTO commandCooldowns (userId, commandName, lastUsed) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE lastUsed = VALUES(lastUsed)", [interaction?.user?.id, command?.data?.name, now])

    return await command.execute(interaction)
  } catch (error) {
    console.error(error)

    if (interaction.replied || interaction.deferred) {
      return await interaction.followUp({ embeds: [failEmbed("Bot Status", "Something bad occured while trying to run this command", interaction?.user)] })
    } else {
      return await interaction.reply({ embeds: [failEmbed("Bot Status", "Something bad occured while trying to run this command", interaction?.user)] })
    }
  }
})

client.once(Events.ClientReady, async (readyClient) => {
  await loadCommands()
  await registerCommand(readyClient?.user?.id)

  client?.user?.setPresence({
    activities: [
      {
        name: "ff?help | FFFYou",
        type: ActivityType.Playing
      }
    ],
    status: "dnd"
  })

  console.log(`Successfully logged as ${readyClient?.user?.tag}`)
})

client.login(config.token)
