import { ChatInputCommandInteraction, Message, SlashCommandBuilder, SlashCommandSubcommandBuilder, type SlashCommandOptionsOnlyBuilder } from "discord.js"

export interface SlashCommand {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<Message<boolean> | void | undefined>
}
