import { REST, Routes } from "discord.js"
import config from "../config.json"

const rest = new REST({ version: "10" }).setToken(config.token);

(async () => {
  try {
    console.log("Deleting all commands")

    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: [] })

    console.log(`Successfully deleted all commands`)
  } catch (error) {
    console.error(`Error occured ${error}`)
  }
})()
