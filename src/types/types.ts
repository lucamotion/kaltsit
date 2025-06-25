import { type Ok, type Result } from "neverthrow";
import { type Command } from "../structs/commands/Command.js";
import { CommandContext } from "../structs/commands/CommandContext.js";
import { type CommandWithSubcommandGroups } from "../structs/commands/CommandWithSubcommandGroups.js";
import { type CommandWithSubcommands } from "../structs/commands/CommandWithSubcommands.js";
import { type BaseOption } from "../structs/commands/options/BaseOption.js";
import { Subcommand } from "../structs/commands/Subcommand.js";
import { TransformerContext } from "../structs/commands/TransformerContext.js";

export type ContextMutator<SourceCommand extends Command> = (
  context: CommandContext<SourceCommand>,
) => Promise<CommandContext<SourceCommand>>;

export type Precondition<SourceCommand extends Command> = (
  ctx: CommandContext<SourceCommand>,
) => Promise<Result<boolean, Error>>;

type Transformer<
  Input,
  Output extends Result<any, any> | Promise<Result<any, any>>,
> = (value: Input, ctx: TransformerContext) => Output;

export type SingleTransformer<
  Input extends any,
  Output extends Result<any, any> = Result<any, any>,
> = Transformer<Input, Output>;
export type AsyncSingleTransformer<
  Input extends any,
  Output extends Result<any, any> = Result<any, any>,
> = Transformer<Input, Promise<Output>>;
export type MultiTransformer<
  Input extends Array<any>,
  Output extends Result<unknown, unknown> = Result<unknown, unknown>,
> = Transformer<Input, Output>;
export type AsyncMultiTransformer<
  Input = Array<string>,
  Output extends Result<any, any> = Result<any, any>,
> = Transformer<Input, Promise<Output>>;

export type AnyCommand =
  | Command
  | CommandWithSubcommandGroups
  | CommandWithSubcommands<boolean>;

type CommandOptions<SourceCommand extends Command> = SourceCommand["options"];

type OptionalizeResult<ResultType extends Result<unknown, unknown>> =
  ResultType extends Result<infer Output, never>
    ? Ok<Output | undefined, never>
    : ResultType extends Result<infer Output, infer Error>
      ? Result<Output | undefined, Error>
      : never;

type OptionalizeIfNotRequired<
  Output extends Result<unknown, unknown>,
  Required extends boolean,
> = Required extends true ? Output : OptionalizeResult<Output>;

type InferTransformerOutput<
  T extends
    | MultiTransformer<Array<any>>
    | AsyncMultiTransformer<Array<any>>
    | SingleTransformer<any>
    | AsyncSingleTransformer<any>
    | undefined,
> =
  T extends MultiTransformer<any, infer MultiOutput>
    ? MultiOutput
    : T extends AsyncMultiTransformer<any, infer AsyncMultiOutput>
      ? Awaited<AsyncMultiOutput>
      : T extends SingleTransformer<any, infer SingleOutput>
        ? SingleOutput
        : T extends AsyncSingleTransformer<any, infer AsyncSingleOutput>
          ? Awaited<AsyncSingleOutput>
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
  | BaseOption<
      string,
      boolean,
      SingleTransformer<any> | AsyncSingleTransformer<any>,
      undefined
    >
  | BaseOption<
      string,
      boolean,
      undefined,
      MultiTransformer<Array<any>> | AsyncMultiTransformer<Array<any>>
    >;

/** Generates an input type from {@link Command.options} for use in {@link parseOptions} */
export type ParseOptionsInput<SourceCommand extends Command> = {
  [key in CommandOptions<SourceCommand>[number] as key["name"]]: key["required"] extends true
    ? key["transform"] extends
        | SingleTransformer<any>
        | AsyncSingleTransformer<any>
      ? Parameters<key["transform"]>[0]
      : key["multiTransform"] extends
            | MultiTransformer<any>
            | AsyncMultiTransformer<any>
        ? Parameters<key["multiTransform"]>[0]
        : never
    : key["transform"] extends
          | SingleTransformer<any>
          | AsyncSingleTransformer<any>
      ? Parameters<key["transform"]>[0] | undefined
      : key["multiTransform"] extends
            | MultiTransformer<any>
            | AsyncMultiTransformer<any>
        ? Parameters<key["multiTransform"]>[0] | undefined
        : never;
};

type SubcommandPath<Subcommand extends CommandWithSubcommands> =
  | Subcommand["name"]
  | `${Subcommand["name"]}.${Subcommand["commands"][number]["name"]}`;

type SubcommandGroupPath<SubcommandGroup extends CommandWithSubcommandGroups> =
  | SubcommandGroup["name"]
  | `${SubcommandGroup["name"]}.${SubcommandGroup["subcommandGroups"][number]["name"]}`
  | {
      [key2 in SubcommandGroup["subcommandGroups"][number] as key2["name"]]: `${SubcommandGroup["name"]}.${key2["name"]}.${key2["commands"][number]["name"]}`;
    }[SubcommandGroup["subcommandGroups"][number]["name"]];

export type CommandPath<Command extends AnyCommand> =
  Command extends CommandWithSubcommandGroups
    ? SubcommandGroupPath<Command>
    : Command extends CommandWithSubcommands
      ? SubcommandPath<Command>
      : Command["name"];

type ResolveSubcommandGroup<
  CommandArray extends ReadonlyArray<AnyCommand>,
  GroupName extends string,
  SubcommandName extends string,
  CommandName extends string,
> = Extract<
  Extract<
    Extract<
      CommandArray[number],
      CommandWithSubcommandGroups & { name: GroupName }
    >["subcommandGroups"][number],
    CommandWithSubcommands & { name: SubcommandName }
  >["commands"][number],
  Subcommand & { name: CommandName }
>;

type ResolveSubcommand<
  CommandArray extends ReadonlyArray<AnyCommand>,
  SubcommandName extends string,
  CommandName extends string,
> =
  | Extract<
      Extract<
        CommandArray[number],
        CommandWithSubcommands & { name: SubcommandName }
      >["commands"][number],
      Subcommand & { name: CommandName }
    >
  | Extract<
      Extract<
        CommandArray[number],
        CommandWithSubcommandGroups & { name: SubcommandName }
      >["subcommandGroups"][number],
      CommandWithSubcommands & { name: CommandName }
    >;

type ResolveCommand<
  CommandArray extends ReadonlyArray<AnyCommand>,
  CommandName extends string,
> = Extract<CommandArray[number], { name: CommandName }>;

export type CommandRecordWithPaths<
  CommandArray extends ReadonlyArray<AnyCommand>,
> = {
  [key in CommandPath<
    CommandArray[number]
  >]: key extends `${infer GroupName}.${infer SubcommandName}.${infer CommandName}`
    ? ResolveSubcommandGroup<
        CommandArray,
        GroupName,
        SubcommandName,
        CommandName
      >
    : key extends `${infer SubcommandName}.${infer CommandName}`
      ? ResolveSubcommand<CommandArray, SubcommandName, CommandName>
      : key extends `${infer CommandName}`
        ? ResolveCommand<CommandArray, CommandName>
        : never;
};
