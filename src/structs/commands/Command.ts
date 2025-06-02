import { type InteractionContextType } from "discord.js";
import { generateCommandId } from "../../lib/ids.js";
import { dataStore } from "../../main.js";
import {
  AsyncMultiTransformer,
  AsyncSingleTransformer,
  type MultiTransformer,
  type ParseOptionsInput,
  type Precondition,
  type SingleTransformer,
} from "../../types/types.js";
import { BaseCommand } from "./BaseCommand.js";
import { type CommandContext } from "./CommandContext.js";
import { type CommandOption } from "./options/CommandOption.js";

export abstract class Command<
  Self extends Command<Self> = any,
> extends BaseCommand {
  public id: string;
  abstract options: ReadonlyArray<
    | CommandOption<
        any,
        boolean,
        SingleTransformer<any> | AsyncSingleTransformer<any>,
        undefined
      >
    | CommandOption<
        any,
        boolean,
        undefined,
        MultiTransformer<any> | AsyncMultiTransformer<any>
      >
  >;
  abstract preconditions: Array<Precondition<Command<Self>>>;
  abstract contexts: Array<InteractionContextType>;

  abstract execute(ctx: CommandContext<Command<Self>>): Promise<unknown>;

  constructor() {
    super();
    this.id = generateCommandId();
  }

  public generateButtonCustomId(
    input: ParseOptionsInput<Self>,
  ): `${Self["id"]}:${string}` {
    const uuid = crypto.randomUUID();
    dataStore.set(uuid, input);

    setTimeout(() => {
      dataStore.delete(uuid);
    }, 50000);

    return `${this.id}:${uuid}`;
  }

  public generateSelectCustomId<
    Overwrite extends Exclude<Self["options"][number]["name"], "overwrites">,
  >(
    overwrites: Overwrite,
    input: Omit<ParseOptionsInput<Self>, Overwrite> & {
      [key in Overwrite]?: ParseOptionsInput<Self>[key] | undefined;
    },
  ): `${Self["id"]}:${string}` {
    const uuid = crypto.randomUUID();
    dataStore.set(uuid, { ...input, overwrites });

    setTimeout(() => {
      dataStore.delete(uuid);
    }, 50000);

    return `${this.id}:${uuid}`;
  }

  public usePreconditions(precondition: Array<Precondition<Command<Self>>>) {
    this.preconditions.push(...precondition);
    return this;
  }
}
