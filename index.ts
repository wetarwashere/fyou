import { Client, Collection, Events, GatewayIntentBits } from "discord.js"
import config from "./config.json"
import { ping } from "./commands/utility/ping";
import { randomAnime } from "./commands/randomAnime";
import { kbbi } from "./commands/kbbi";
import { dictionary } from "./commands/dictionary";
import { commands, setCommand } from "./utils/func"
import { charSearch } from "./commands/charSearch";
import { getAvatar } from "./commands/getAvatar";

const client = new Client({ intents: [GatewayIntentBits.Guilds] })
client.cooldowns = new Collection()

// Important
setCommand(ping)
setCommand(randomAnime)
setCommand(kbbi)
setCommand(dictionary)
setCommand(charSearch)
setCommand(getAvatar)

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  const command = commands.get(interaction.commandName)

  if (!command) {
    console.error(`${interaction.commandName} is not a valid command`)
  }

  const { cooldowns } = client

  if (!cooldowns.has(command?.data?.name)) {
    cooldowns.set(command?.data?.name, new Collection())
  }

  const now = Date.now()
  const timestamps = cooldowns.get(command?.data?.name)
  const defaultCooldownDuration = 10
  const cooldownAmount = (command?.cooldown ?? defaultCooldownDuration) * 1000

  if (timestamps?.has(interaction.user.id)) {
    const expired = timestamps.get(interaction?.user?.id)! + cooldownAmount

    if (now < expired) {
      const expireTimestamps = Math.round(expired / 1000)

      return await interaction.reply({ content: `Calm down, you can do it again after <t:${expireTimestamps}:R>.` })
    }
  }

  timestamps?.set(interaction?.user?.id, now)
  setTimeout(() => timestamps?.delete(interaction?.user?.id), cooldownAmount)

  try {
    await command?.execute(interaction)
  } catch (error) {
    console.error(error)

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: "❌ Something bad occured while trying to run this command" })
    } else {
      await interaction.reply({ content: "❌ Something bad occured while trying to run this command" })
    }
  }
})
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged as ${readyClient.user.tag}`)
})
client.login(config.token)
