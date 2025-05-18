import { Command } from "./Command.js";

export abstract class Subcommand<Name extends string> extends Command<Name> {}
