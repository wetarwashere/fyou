import { Client, Events, GatewayIntentBits } from "discord.js"
import config from "./config.json"
import { ping } from "./commands/utility/ping";
import { randomAnime } from "./commands/randomAnime";
import { kbbi } from "./commands/kbbi";
import { dictionary } from "./commands/dictionary";
import { commands, setCommand } from "./utils/func"

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

// Important
setCommand(ping)
setCommand(randomAnime)
setCommand(kbbi)
setCommand(dictionary)

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  const command = commands.get(interaction.commandName)

  if (!command) {
    console.log(`${interaction.commandName} is not a valid command`)
  }

  try {
    await command?.execute(interaction)
  } catch (error) {
    console.error(error)

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: "Something bad occured while trying to run this command" })
    } else {
      await interaction.reply({ content: "Something bad occured while trying to run this command" })
    }
  }
})
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Logged as ${readyClient.user.tag}`)
})
client.login(config.token)
