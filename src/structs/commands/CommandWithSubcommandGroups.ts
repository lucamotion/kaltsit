import { BaseCommand } from "./BaseCommand.js";
import { CommandWithSubcommands } from "./CommandWithSubcommands.js";

export abstract class CommandWithSubcommandGroups extends BaseCommand {
  abstract subcommandGroups: Array<CommandWithSubcommands>;
}
