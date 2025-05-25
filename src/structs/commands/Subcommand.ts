import { Command } from "./Command.js";

export abstract class Subcommand extends Command {
  abstract contexts: never;
}
