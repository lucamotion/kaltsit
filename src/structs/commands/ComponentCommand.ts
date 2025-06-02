import { Command } from "./Command.js";

export abstract class ComponentCommand<
  Self extends ComponentCommand<Self> = any,
> extends Command<Self> {}
