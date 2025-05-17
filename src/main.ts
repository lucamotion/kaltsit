import { BaseCommand } from "./core/structs/BaseCommand.js";
import { Bot } from "./core/structs/Bot.js";
import { Command } from "./core/structs/Command.js";
import { CommandContext } from "./core/structs/CommandContext.js";
import { CommandManager } from "./core/structs/CommandManager.js";
import { TextInputBuilder } from "./core/structs/modal/TextInputBuilder.js";
import { CommandOption } from "./core/structs/options/CommandOption.js";
import { CommandStringOption } from "./core/structs/options/StringOption.js";
import { SelectBuilder } from "./core/structs/select/SelectBuilder.js";
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
