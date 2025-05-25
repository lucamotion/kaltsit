import { type InteractionContextType } from "discord.js";
import { BaseCommand } from "./BaseCommand.js";
import { type Subcommand } from "./Subcommand.js";

export abstract class CommandWithSubcommands<
  CanHaveContexts extends boolean = true,
> extends BaseCommand {
  abstract commands: Array<Subcommand>;
  abstract contexts: CanHaveContexts extends true
    ? Array<InteractionContextType>
    : never;
}
