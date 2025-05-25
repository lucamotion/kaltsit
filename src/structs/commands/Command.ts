import { type InteractionContextType } from "discord.js";
import { generateCommandId } from "../../lib/ids.js";
import { dataStore } from "../../main.js";
import {
  type MultiTransformer,
  type ParseOptionsInput,
  type Precondition,
  type SingleTransformer,
} from "../../types/types.js";
import { BaseCommand } from "./BaseCommand.js";
import { type CommandContext } from "./CommandContext.js";
import { type CommandOption } from "./options/CommandOption.js";

export abstract class Command extends BaseCommand {
  public id: string;
  abstract options: ReadonlyArray<
    | CommandOption<string, boolean, SingleTransformer, undefined>
    | CommandOption<string, boolean, undefined, MultiTransformer>
  >;
  abstract preconditions: Array<Precondition<Command>>;
  abstract contexts: Array<InteractionContextType>;

  abstract execute(ctx: CommandContext<Command>): Promise<unknown>;

  constructor() {
    super();
    this.id = generateCommandId();
  }

  public generateButtonCustomId<SourceCommand extends Command>(
    input: ParseOptionsInput<SourceCommand>,
  ): `${SourceCommand["id"]}:${string}` {
    const uuid = crypto.randomUUID();
    dataStore.set(uuid, input);

    setTimeout(() => {
      dataStore.delete(uuid);
    }, 50000);

    return `${this.id}:${uuid}`;
  }

  public generateSelectCustomId<SourceCommand extends Command>(
    overwrites: Exclude<SourceCommand["options"][number]["name"], "overwrites">,
    input: ParseOptionsInput<SourceCommand>,
  ): `${SourceCommand["id"]}:${string}` {
    const uuid = crypto.randomUUID();
    dataStore.set(uuid, { ...input, overwrites });

    setTimeout(() => {
      dataStore.delete(uuid);
    }, 50000);

    return `${this.id}:${uuid}`;
  }

  public usePreconditions(precondition: Array<Precondition<Command>>) {
    this.preconditions.push(...precondition);
    return this;
  }
}
