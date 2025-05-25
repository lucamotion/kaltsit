import { BaseCommand } from "./BaseCommand.js";
import { type CommandWithSubcommands } from "./CommandWithSubcommands.js";

export abstract class CommandWithSubcommandGroups extends BaseCommand {
  abstract subcommandGroups: Array<CommandWithSubcommands>;
}
