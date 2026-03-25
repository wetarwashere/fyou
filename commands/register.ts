import { REST, Routes } from "discord.js"
import config from "../config.json"
import { ping } from "./utility/ping"
import { randomAnime } from "./randomAnime";
import { kbbi } from "./kbbi";
import { dictionary } from "./dictionary";
import { charSearch } from "./charSearch";
import { getAvatar } from "./getAvatar";

const commands = [
  ping.data.toJSON(),
  randomAnime.data.toJSON(),
  kbbi.data.toJSON(),
  dictionary.data.toJSON(),
  charSearch.data.toJSON(),
  getAvatar.data.toJSON()
]
const rest = new REST({ version: "10" }).setToken(config.token);

(async () => {
  try {
    console.log(`Deploying ${commands.length} command/s`)

    await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), { body: commands })

    console.log(`Successfully registered ${commands.length} command/s`)
  } catch (error) {
    console.error(`Error occured ${error}`)
  }
})()
