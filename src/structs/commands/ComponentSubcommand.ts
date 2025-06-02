import { Subcommand } from "./Subcommand.js";

export abstract class ComponentSubcommand<
  Self extends ComponentSubcommand<Self> = any,
> extends Subcommand<Self> {}
