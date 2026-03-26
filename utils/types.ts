import { ChatInputCommandInteraction, InteractionResponse, Message, SlashCommandBuilder, SlashCommandSubcommandBuilder, type SlashCommandOptionsOnlyBuilder } from "discord.js"
import type { RowDataPacket } from "mysql2";

export interface SlashCommand {
  cooldown?: number;
  aliases?: string[];
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandBuilder;
  execute: (context: ChatInputCommandInteraction | Message, args?: string[]) => Promise<Message<boolean> | undefined | InteractionResponse<boolean> | void> | InteractionResponse<boolean> | void
}
export interface CooldownRows extends RowDataPacket {
  userId: string
  commandName: string
  lastUsed: number
}
export interface CommandSettingsRows extends RowDataPacket {
  commandName: string
  cooldown: number
  allowedChannelId: string
}
export interface GuildSettingsRows extends RowDataPacket {
  guildId: string
  prefix: string
  allowedChannels: string
}
