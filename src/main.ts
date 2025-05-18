import "dotenv/config";
import { BaseCommand } from "./structs/BaseCommand.js";
import { Bot } from "./structs/Bot.js";
import { Command } from "./structs/Command.js";
import { CommandContext } from "./structs/CommandContext.js";
import { CommandManager } from "./structs/CommandManager.js";
import { TextInputBuilder } from "./structs/modal/TextInputBuilder.js";
import { CommandOption } from "./structs/options/CommandOption.js";
import { CommandStringOption } from "./structs/options/StringOption.js";
import { SelectBuilder } from "./structs/select/SelectBuilder.js";
import { ParseOptionsInput } from "./types/types.js";

export const dataStore: Map<
  string,
  ParseOptionsInput<Command<string>>
> = new Map();

export * from "discord.js";
export * from "neverthrow";
export {
  BaseCommand,
  Bot,
  Command,
  CommandContext,
  CommandManager,
  CommandOption,
  CommandStringOption,
  SelectBuilder,
  TextInputBuilder,
};
