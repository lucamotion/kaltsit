import "dotenv/config";
import { Bot } from "./structs/Bot.js";
import { BaseCommand } from "./structs/commands/BaseCommand.js";
import { Command } from "./structs/commands/Command.js";
import { CommandContext } from "./structs/commands/CommandContext.js";
import { CommandManager } from "./structs/commands/CommandManager.js";
import { CommandWithSubcommandGroups } from "./structs/commands/CommandWithSubcommandGroups.js";
import { CommandWithSubcommands } from "./structs/commands/CommandWithSubcommands.js";
import { ComponentCommand } from "./structs/commands/ComponentCommand.js";
import { ComponentSubcommand } from "./structs/commands/ComponentSubcommand.js";
import { CommandOption } from "./structs/commands/options/CommandOption.js";
import { RoleOption } from "./structs/commands/options/RoleOption.js";
import { CommandStringOption } from "./structs/commands/options/StringOption.js";
import { UserOption } from "./structs/commands/options/UserOption.js";
import { Subcommand } from "./structs/commands/Subcommand.js";
import {
  KaltsitError,
  PermissionsError,
} from "./structs/error/KaltsitError.js";
import { TextInputBuilder } from "./structs/modal/TextInputBuilder.js";
import {
  RoleSelectBuilder,
  SelectBuilder,
} from "./structs/select/SelectBuilder.js";
import { ParseOptionsInput, Precondition } from "./types/types.js";

export const dataStore: Map<string, ParseOptionsInput<Command>> = new Map();

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
  CommandWithSubcommandGroups,
  CommandWithSubcommands,
  ComponentCommand,
  ComponentSubcommand,
  KaltsitError,
  PermissionsError,
  RoleOption,
  RoleSelectBuilder,
  SelectBuilder,
  Subcommand,
  TextInputBuilder,
  UserOption,
  type Precondition,
};
