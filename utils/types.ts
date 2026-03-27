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
export interface CharData {
  data: {
    mal_id: number
    images?: {
      jpg: {
        image_url: string
      },
      webp: {
        image_url: string
      }
    }
    name: string
    name_kanji: string
    nicknames: string[]
    favorites: number
  }[]
}
export interface RandomCharData {
  data: {
    mal_id: number
    images?: {
      jpg: {
        image_url: string
      },
      webp: {
        image_url: string
      }
    }
    name: string
    name_kanji: string
    nicknames: string[]
    favorites: number
  }
}
export interface RandomAnimeData {
  data: {
    mal_id: number,
    images?: {
      jpg: {
        image_url: string
      },
      webp: {
        image_url: string
      }
    }
    title: string,
    title_english?: string,
    title_japanese: string,
    score: number,
    scored_by: number,
    genres: { mal_id: number, name: string, url: string }[]
  }
}
export interface KbbiWordData {
  data: {
    word: string,
    lema: string,
    arti: { deskripsi: string }[]
  }[]
}
type MeaningsType = {
  partOfSpeech: string,
  definitions: { definition: string }[]
}
export interface DictWordData {
  word: string,
  phonetic: string,
  meanings: MeaningsType[]
}
export type CharOrigin = {
  data: {
    anime: {
      anime: {
        title: string
      }
    }[]
  }
}
