import { ChatInputCommandInteraction, Collection, Message, SlashCommandBuilder, SlashCommandSubcommandBuilder, type SlashCommandOptionsOnlyBuilder } from "discord.js"

export interface SlashCommand {
  cooldown?: number;
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<Message<boolean> | void | undefined>
}

declare module "discord.js" {
  export interface Client {
    cooldowns: Collection<string | undefined, Collection<string, number>>
  }
}
