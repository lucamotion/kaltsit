import { Command } from "./Command.js";

/** A command that is only used via component interactions.
 * Commands that extend this class will not be registered as slash commands.
 */
export abstract class ComponentCommand<
  Self extends ComponentCommand<Self> = any,
> extends Command<Self> {}
