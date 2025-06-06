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
import { AttachmentOption } from "./structs/commands/options/AttachmentOption.js";
import { BooleanOption } from "./structs/commands/options/BooleanOption.js";
import { ChannelOption } from "./structs/commands/options/ChannelOption.js";
import { CommandOption } from "./structs/commands/options/CommandOption.js";
import { NumberOption } from "./structs/commands/options/NumberOption.js";
import { RoleOption } from "./structs/commands/options/RoleOption.js";
import { StringOption } from "./structs/commands/options/StringOption.js";
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
  AttachmentOption,
  BaseCommand,
  BooleanOption,
  Bot,
  ChannelOption,
  Command,
  CommandContext,
  CommandManager,
  CommandOption,
  CommandWithSubcommandGroups,
  CommandWithSubcommands,
  ComponentCommand,
  ComponentSubcommand,
  KaltsitError,
  NumberOption,
  PermissionsError,
  RoleOption,
  RoleSelectBuilder,
  SelectBuilder,
  StringOption,
  Subcommand,
  TextInputBuilder,
  UserOption,
  type Precondition,
};
