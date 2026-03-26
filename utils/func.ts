import { Collection, REST, Routes, Client, GatewayIntentBits } from "discord.js"
import type { SlashCommand } from "./types";
import config from "../config.json"
import path from "node:path"
import fs from "node:fs"
import { pathToFileURL } from "node:url";

type CharOrigin = {
  data: {
    anime: {
      anime: {
        title: string
      }
    }[]
  }
}

export const getCharOrigin = async (id: number) => {
  if (id < 0) {
    return
  }

  const data = await fetch(`https://api.jikan.moe/v4/characters/${encodeURIComponent(id)}/full`)

  if (!data.ok) {
    console.error(`Error occured when fetching data`)
  }

  const json = await data.json() as CharOrigin

  return json
}
export const commands = new Collection<string, SlashCommand>();
export const registerCommand = async (clientId: string) => {
  const rest = new REST().setToken(config.token)
  const commandDatas = Array.from(commands.values()).map(command => command?.data.toJSON())

  try {
    console.log(`Deploying ${commandDatas.length} command/s`)

    await rest.put(Routes.applicationGuildCommands(clientId, config.guildId), { body: commandDatas })

    console.log(`Successfully registered ${commandDatas.length} command/s`)
  } catch (error) {
    console.error(`Error occured ${error}`)
  }
}
export const loadCommands = async () => {
  const dictPath = path.join(__dirname, "../commands")
  const getFiles = (dir: string): string[] => {
    let results: string[] = []
    const list = fs.readdirSync(dir)

    for (const file of list) {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)

      if (stat && stat.isDirectory()) {
        results = results.concat(getFiles(filePath))
      } else if (file.endsWith(".ts")) {
        results.push(filePath)
      }
    }

    return results
  }
  const allCommandFiles = getFiles(dictPath)

  for (const filePath of allCommandFiles) {
    const fileUrl = pathToFileURL(filePath).href
    const module = await import(fileUrl)
    const command: SlashCommand = module.default || Object.values(module).find(val => val && typeof val === "object" && "data" in val && "execute" in val)

    if (command && "data" in command && "execute" in command) {
      commands.set(command.data.name, command)
      console.log(`Successfully loaded the ${command.data.name} command`)
    } else {
      console.error(`Failed to load command`)
    }
  }

  return commands
}
export const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages], allowedMentions: { parse: [], repliedUser: false } })
