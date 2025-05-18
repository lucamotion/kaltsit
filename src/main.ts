import "dotenv/config";
import { Bot } from "./structs/Bot.js";
import { BaseCommand } from "./structs/commands/BaseCommand.js";
import { Command } from "./structs/commands/Command.js";
import { CommandContext } from "./structs/commands/CommandContext.js";
import { CommandManager } from "./structs/commands/CommandManager.js";
import { CommandOption } from "./structs/commands/options/CommandOption.js";
import { CommandStringOption } from "./structs/commands/options/StringOption.js";
import { PermissionsError, TexasError } from "./structs/error/TexasError.js";
import { TextInputBuilder } from "./structs/modal/TextInputBuilder.js";
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
  PermissionsError,
  SelectBuilder,
  TexasError,
  TextInputBuilder,
};
