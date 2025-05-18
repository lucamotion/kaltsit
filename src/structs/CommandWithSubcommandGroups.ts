import { BaseCommand } from "./BaseCommand.js";
import { CommandWithSubcommands } from "./CommandWithSubcommands.js";

export abstract class CommandWithSubcommandGroups<
  Name extends string,
> extends BaseCommand<Name> {
  abstract subcommandGroups: Array<CommandWithSubcommands<string>>;
}
