import { type InteractionContextType } from "discord.js";
import { BaseCommand } from "./BaseCommand.js";
import { type Subcommand } from "./Subcommand.js";

/** A container for several subcommands. Cannot be executed. */
export abstract class CommandWithSubcommands<
  CanHaveContexts extends boolean = true,
> extends BaseCommand {
  abstract commands: Array<Subcommand>;
  abstract contexts: CanHaveContexts extends true
    ? Array<InteractionContextType>
    : never;
}
