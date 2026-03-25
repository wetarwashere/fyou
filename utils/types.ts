import { ChatInputCommandInteraction, Collection, InteractionResponse, Message, SlashCommandBuilder, SlashCommandSubcommandBuilder, type SlashCommandOptionsOnlyBuilder } from "discord.js"

export interface SlashCommand {
  cooldown?: number;
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<Message<boolean> | undefined | InteractionResponse<boolean> | void> | InteractionResponse<boolean>
}

declare module "discord.js" {
  export interface Client {
    cooldowns: Collection<string, Collection<string, number>>
  }
}
