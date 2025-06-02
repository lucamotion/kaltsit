import { type Ok, type Result } from "neverthrow";
import { type CommandContext, type Subcommand } from "../main.js";
import { type Command } from "../structs/commands/Command.js";
import { type CommandWithSubcommandGroups } from "../structs/commands/CommandWithSubcommandGroups.js";
import { type CommandWithSubcommands } from "../structs/commands/CommandWithSubcommands.js";
import { type CommandOption } from "../structs/commands/options/CommandOption.js";

export type ContextMutator<SourceCommand extends Command> = (
  context: CommandContext<SourceCommand>,
) => Promise<CommandContext<SourceCommand>>;

export type Precondition<SourceCommand extends Command> = (
  ctx: CommandContext<SourceCommand>,
) => Promise<Result<true, Error>>;

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
  | Command
  | CommandWithSubcommandGroups
  | CommandWithSubcommands<boolean>;

type CommandOptions<SourceCommand extends Command> = SourceCommand["options"];

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
export type ParseOptionsInput<SourceCommand extends Command> = {
  [key in CommandOptions<SourceCommand>[number] as key["name"]]: key["required"] extends true
    ? string | string[]
    : string | string[] | undefined;
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
