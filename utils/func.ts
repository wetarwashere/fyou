import { Collection } from "discord.js"
import type { SlashCommand } from "./types";

export const commands = new Collection<string, SlashCommand>();
export const setCommand = (name: SlashCommand) => {
  commands.set(name.data.name, name)

  return commands
}
