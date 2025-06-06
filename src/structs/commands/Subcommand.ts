import { Command } from "./Command.js";

export abstract class Subcommand<
  Self extends Subcommand<Self> = any,
> extends Command<Self> {
  contexts: never = undefined as never;
}
