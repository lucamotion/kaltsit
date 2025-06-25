import "dotenv/config";
import { Bot } from "./structs/Bot.js";
import { Command } from "./structs/commands/Command.js";
import { CommandContext } from "./structs/commands/CommandContext.js";
import { CommandManager } from "./structs/commands/CommandManager.js";
import { CommandWithSubcommandGroups } from "./structs/commands/CommandWithSubcommandGroups.js";
import { CommandWithSubcommands } from "./structs/commands/CommandWithSubcommands.js";
import { ComponentCommand } from "./structs/commands/ComponentCommand.js";
import { ComponentSubcommand } from "./structs/commands/ComponentSubcommand.js";
import { AttachmentOption } from "./structs/commands/options/AttachmentOption.js";
import { BaseOption } from "./structs/commands/options/BaseOption.js";
import { BooleanOption } from "./structs/commands/options/BooleanOption.js";
import { ChannelOption } from "./structs/commands/options/ChannelOption.js";
import { NumberOption } from "./structs/commands/options/NumberOption.js";
import { RoleOption } from "./structs/commands/options/RoleOption.js";
import { StringOption } from "./structs/commands/options/StringOption.js";
import { UserOption } from "./structs/commands/options/UserOption.js";
import { Subcommand } from "./structs/commands/Subcommand.js";
import { TextInputBuilder } from "./structs/modal/TextInputBuilder.js";
import {
  RoleSelectBuilder,
  SelectBuilder,
} from "./structs/select/SelectBuilder.js";
import type { CommandRecordWithPaths, Precondition } from "./types/types.js";

export * from "discord.js";
export * from "neverthrow";
export {
  AttachmentOption,
  BaseOption,
  BooleanOption,
  Bot,
  ChannelOption,
  Command,
  CommandContext,
  CommandManager,
  CommandWithSubcommandGroups,
  CommandWithSubcommands,
  ComponentCommand,
  ComponentSubcommand,
  NumberOption,
  RoleOption,
  RoleSelectBuilder,
  SelectBuilder,
  StringOption,
  Subcommand,
  TextInputBuilder,
  UserOption,
  type CommandRecordWithPaths,
  type Precondition,
};
