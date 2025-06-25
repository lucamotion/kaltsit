import { Subcommand } from "./Subcommand.js";

/** A subcommand that is only used via component interactions.
 * Subcommands that extend this class will not be registered as slash commands.
 */
export abstract class ComponentSubcommand<
  Self extends ComponentSubcommand<Self> = any,
> extends Subcommand<Self> {}
