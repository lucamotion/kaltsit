import { generateCommandId } from "../../lib/ids.js";
import { dataStore } from "../../main.js";
import {
  MultiTransformer,
  ParseOptionsInput,
  Precondition,
  SingleTransformer,
} from "../../types/types.js";
import { BaseCommand } from "./BaseCommand.js";
import { CommandContext } from "./CommandContext.js";
import { CommandOption } from "./options/CommandOption.js";

export abstract class Command<Name extends string> extends BaseCommand<Name> {
  public id: string;
  abstract options: ReadonlyArray<
    | CommandOption<string, boolean, SingleTransformer, undefined>
    | CommandOption<string, boolean, undefined, MultiTransformer>
  >;
  abstract preconditions: Array<Precondition<Command<Name>>>;

  abstract execute(ctx: CommandContext<Command<Name>>): Promise<unknown>;

  constructor(name: Name) {
    super(name);
    this.id = generateCommandId();
  }

  public generateButtonCustomId<SourceCommand extends Command<Name>>(
    input: ParseOptionsInput<SourceCommand>,
  ): `${SourceCommand["id"]}:${string}` {
    const uuid = crypto.randomUUID();
    dataStore.set(uuid, input);

    setTimeout(() => {
      dataStore.delete(uuid);
    }, 50000);

    return `${this.id}:${uuid}`;
  }

  public generateSelectCustomId<SourceCommand extends Command<Name>>(
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

  public usePreconditions(precondition: Array<Precondition<Command<Name>>>) {
    this.preconditions.push(...precondition);
    return this;
  }
}
