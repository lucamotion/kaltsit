import { BaseCommand } from "./BaseCommand.js";
import { Subcommand } from "./Subcommand.js";

export abstract class CommandWithSubcommands<
  Name extends string,
> extends BaseCommand<Name> {
  abstract commands: Array<Subcommand<string>>;
}
