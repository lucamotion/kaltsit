import { type InteractionContextType } from "discord.js";
import { BaseCommand } from "./BaseCommand.js";
import { type CommandWithSubcommands } from "./CommandWithSubcommands.js";

export abstract class CommandWithSubcommandGroups extends BaseCommand {
  abstract subcommandGroups: Array<CommandWithSubcommands<false>>;
  abstract contexts: Array<InteractionContextType>;
}
