import { type InteractionContextType } from "discord.js";
import { Result } from "neverthrow";
import { dataStore } from "../../lib/dataStore.js";
import { generateCommandId } from "../../lib/ids.js";
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
  /**
   * The automatically-generated internal ID of the command,
   * used for resolving commands from interactions.
   */
  public readonly id: string;

  /**
   * The options of the command.
   */
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

  /**
   * The preconditions of the command.
   */
  abstract preconditions: Array<Precondition<Command<Self>>>;

  /**
   * The contexts of the command.
   */
  abstract contexts: Array<InteractionContextType>;

  /**
   * The function to execute when the command is invoked.
   */
  abstract execute(
    ctx: CommandContext<Command<Self>>,
  ): Promise<Result<void, Error>>;

  constructor() {
    super();
    this.id = generateCommandId();
  }

  /**
   * Generates a Button custom ID for this command.
   * @param input - The options to encode in this button.
   */
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

  /**
   * Generates a Select custom ID for this command.
   * @param overwrites - The option to overwrite with the selected values.
   * @param input - The options to encode in this select menu.
   */
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

  /**
   * Adds preconditions to this command.
   * @param precondition - The preconditions to add.
   */
  public usePreconditions(precondition: Array<Precondition<Command<Self>>>) {
    this.preconditions.push(...precondition);
    return this;
  }
}
