import { BaseCommand } from "./BaseCommand.js";
import { type Subcommand } from "./Subcommand.js";

export abstract class CommandWithSubcommands extends BaseCommand {
  abstract commands: Array<Subcommand>;
}
