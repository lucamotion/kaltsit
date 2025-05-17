import { Ok, Result } from "neverthrow";
import { Command } from "../core/structs/Command.js";
import { CommandWithSubcommandGroups } from "../core/structs/CommandWithSubcommandGroups.js";
import { CommandWithSubcommands } from "../core/structs/CommandWithSubcommands.js";
import { CommandOption } from "../core/structs/options/CommandOption.js";

type Transformer<Input, Output extends Result<unknown, unknown>> =
  | ((value: Input) => Output)
  | ((value: Input) => Promise<Output>);

export type SingleTransformer<
  Output extends Result<unknown, unknown> = Result<unknown, unknown>,
> = Transformer<string, Output>;
export type MultiTransformer<
  Output extends Result<unknown, unknown> = Result<unknown, unknown>,
> = Transformer<Array<string>, Output>;

export type AnyCommand =
  | Command<string>
  | CommandWithSubcommandGroups<string>
  | CommandWithSubcommands<string>;

type CommandOptions<SourceCommand extends Command<string>> =
  SourceCommand["options"];

type OptionalizeResult<ResultType extends Result<unknown, unknown>> =
  ResultType extends Ok<infer Output, infer Error>
    ? Ok<Output | undefined, Error>
    : ResultType extends Result<infer Output, infer Error>
      ? Result<Output | undefined, Error>
      : never;

type OptionalizeIfNotRequired<
  Output extends Result<unknown, unknown>,
  Required extends boolean,
> = Required extends true ? Output : OptionalizeResult<Output>;

type InferTransformerOutput<
  T extends MultiTransformer | SingleTransformer | undefined,
> =
  T extends MultiTransformer<infer MultiOutput>
    ? MultiOutput
    : T extends SingleTransformer<infer SingleOutput>
      ? SingleOutput
      : never;

type InferOptionResult<Option extends BaseCommandOption> =
  OptionalizeIfNotRequired<
    InferTransformerOutput<Option["multiTransform"] | Option["transform"]>,
    Option["required"]
  >;

export type CommandOptionsResult<
  Options extends ReadonlyArray<BaseCommandOption>,
> = {
  [Option in Options[number] as Option["name"]]: InferOptionResult<Option>;
};

type BaseCommandOption =
  | CommandOption<string, boolean, SingleTransformer, undefined>
  | CommandOption<string, boolean, undefined, MultiTransformer>;

/** Generates an input type from {@link Command.options} for use in {@link parseOptions} */
export type ParseOptionsInput<SourceCommand extends Command<string>> = {
  [key in CommandOptions<SourceCommand>[number] as key["name"]]: key["required"] extends true
    ? string | string[]
    : string | string[] | undefined;
};
