import { Collection, REST, Routes, Client, GatewayIntentBits } from "discord.js"
import type { CharData, CharOrigin, DictWordData, KbbiWordData, RandomAnimeData, RandomCharData, SlashCommand } from "./types";
import config from "../config.json"
import path from "node:path"
import fs from "node:fs"
import { pathToFileURL } from "node:url";

export const getCharOrigin = async (id: number, retry = 2): Promise<CharOrigin | null> => {
  if (id < 0) return null

  try {
    const data = await fetch(`https://api.jikan.moe/v4/characters/${encodeURIComponent(id)}/full`)

    if (!data.ok) {
      if (retry > 0) {
        await new Promise(retry => setTimeout(retry, 5000))

        return getCharOrigin(id, retry - 1)
      }

      console.error(`Error occured when fetching data`)
      return null
    }

    const json = await data.json() as CharOrigin

    return json
  } catch {
    if (retry > 0) {
      await new Promise(retry => setTimeout(retry, 5000))

      return getCharOrigin(id, retry - 1)
    }

    console.error(`Error occured when fetching data`)
    return null
  }
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
export const getAnimeChar = async (char: string, retry = 2): Promise<CharData | null> => {
  if (!char) return null

  try {
    const data = await fetch(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(char)}`)

    if (!data.ok) {
      if (retry > 0) {
        await new Promise(retry => setTimeout(retry, 5000))

        return getAnimeChar(char, retry - 1)
      }

      console.error(`Error occured when fetching data`)
      return null
    }

    const json = await data.json() as CharData

    return json
  } catch {
    if (retry > 0) {
      await new Promise(retry => setTimeout(retry, 5000))

      return getAnimeChar(char, retry - 1)
    }

    console.error(`Error occured when fetching data`)
    return null
  }
}
export const getRandomCharacter = async (retry = 2): Promise<RandomCharData | null> => {
  try {
    const data = await fetch("https://api.jikan.moe/v4/random/characters")

    if (!data.ok) {
      if (retry > 0) {
        await new Promise(retry => setTimeout(retry, 5000))

        return getRandomCharacter(retry - 1)
      }

      console.error(`Error occured when fetching data`)
      return null
    }

    const json = await data.json() as RandomCharData

    return json
  } catch {
    if (retry > 0) {
      await new Promise(retry => setTimeout(retry, 5000))

      return getRandomCharacter(retry - 1)
    }

    console.error(`Error occured when fetching data`)
    return null
  }
}
export const getRandomAnime = async (retry = 2): Promise<RandomAnimeData | null> => {
  try {
    const data = await fetch("https://api.jikan.moe/v4/random/anime")

    if (!data.ok) {
      if (retry > 0) {
        await new Promise(retry => setTimeout(retry, 5000))

        return getRandomAnime(retry - 1)
      }

      console.error(`Error occured when fetching data`)
      return null
    }

    const json = await data.json() as RandomAnimeData

    return json
  } catch {
    if (retry > 0) {
      await new Promise(retry => setTimeout(retry, 5000))

      return getRandomAnime(retry - 1)
    }

    console.error(`Error occured when fetching data`)
    return null
  }
}
export const getWordFromDict = async (word: string, retry = 2): Promise<DictWordData[] | null> => {
  try {
    const data = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)

    if (!data.ok) {
      if (retry > 0) {
        await new Promise(retry => setTimeout(retry, 5000))

        return getWordFromDict(word, retry - 1)
      }

      console.error(`Error occured when fetching data`)
      return null
    }

    const json = await data.json() as DictWordData[]

    return json
  } catch {
    if (retry > 0) {
      await new Promise(retry => setTimeout(retry, 5000))

      return getWordFromDict(word, retry - 1)
    }

    console.error(`Error occured when fetching data`)
    return null
  }
}
export const getWordFromKbbi = async (word: string, retry = 2): Promise<KbbiWordData | null> => {
  try {
    const data = await fetch(`https://openapi.x-labs.my.id/kbbi/search/${encodeURIComponent(word)}`)

    if (!data.ok) {
      if (retry > 0) {
        await new Promise(retry => setTimeout(retry, 5000))

        return getWordFromKbbi(word, retry - 1)
      }

      console.error(`Error occured when fetching data`)
      return null
    }

    const json = await data.json() as KbbiWordData

    return json
  } catch {
    if (retry > 0) {
      await new Promise(retry => setTimeout(retry, 5000))

      return getWordFromKbbi(word, retry - 1)
    }

    console.error(`Error occured when fetching data`)
    return null
  }
}
export const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages], allowedMentions: { parse: [], repliedUser: false } })
