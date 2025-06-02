import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { err, ok, type Result } from "neverthrow";
import { Command } from "../structs/commands/Command.js";
import { CommandWithSubcommandGroups } from "../structs/commands/CommandWithSubcommandGroups.js";
import { CommandWithSubcommands } from "../structs/commands/CommandWithSubcommands.js";
import { ComponentCommand } from "../structs/commands/ComponentCommand.js";
import { ComponentSubcommand } from "../structs/commands/ComponentSubcommand.js";
import { TransformerContext } from "../structs/commands/TransformerContext.js";
import {
  type AnyCommand,
  type CommandOptionsResult,
  type ParseOptionsInput,
} from "../types/types.js";

export function transformCommands(
  commands: Array<AnyCommand> | ReadonlyArray<AnyCommand>,
): Array<RESTPostAPIChatInputApplicationCommandsJSONBody> {
  const transformedCommands: Array<RESTPostAPIChatInputApplicationCommandsJSONBody> =
    [];

  for (const command of commands) {
    if (command instanceof ComponentCommand) {
      continue;
    } else if (command instanceof Command) {
      transformedCommands.push({
        type: ApplicationCommandType.ChatInput,
        name: command.name,
        description: command.description,
        options: command.options.map((option) => option.toJSON()),
        contexts: command.contexts,
      } satisfies RESTPostAPIChatInputApplicationCommandsJSONBody);
      continue;
    }

    if (command instanceof CommandWithSubcommands) {
      const filteredSubcommands = command.commands.filter(
        (subcommand) => !(subcommand instanceof ComponentSubcommand),
      );

      if (filteredSubcommands.length === 0) {
        continue;
      }

      transformedCommands.push({
        type: ApplicationCommandType.ChatInput,
        name: command.name,
        description: command.description,
        contexts: command.contexts,
        options: filteredSubcommands.map((subcommand) => ({
          type: ApplicationCommandOptionType.Subcommand,
          name: subcommand.name,
          description: subcommand.description,
          options: subcommand.options.map((option) => option.toJSON()),
        })),
      } satisfies RESTPostAPIChatInputApplicationCommandsJSONBody);
      continue;
    }

    if (command instanceof CommandWithSubcommandGroups) {
      const filteredSubcommandGroups = command.subcommandGroups.filter(
        (subcommand) =>
          subcommand.commands.some(
            (cmd) => !(cmd instanceof ComponentSubcommand),
          ),
      );

      if (filteredSubcommandGroups.length === 0) {
        continue;
      }

      transformedCommands.push({
        type: ApplicationCommandType.ChatInput,
        name: command.name,
        description: command.description,
        contexts: command.contexts,
        options: filteredSubcommandGroups.map((group) => ({
          type: ApplicationCommandOptionType.SubcommandGroup,
          name: group.name,
          description: group.description,
          options: group.commands
            .filter((command) => !(command instanceof ComponentSubcommand))
            .map((subcommand) => ({
              type: ApplicationCommandOptionType.Subcommand,
              name: subcommand.name,
              description: subcommand.description,
              options: subcommand.options.map((option) => option.toJSON()),
            })),
        })),
      } satisfies RESTPostAPIChatInputApplicationCommandsJSONBody);
      continue;
    }
  }

  return transformedCommands;
}

export async function parseOptions<SourceCommand extends Command>(
  command: SourceCommand,
  options: ParseOptionsInput<SourceCommand>,
  context: TransformerContext,
): Promise<Result<CommandOptionsResult<SourceCommand["options"]>, string>> {
  const resultOptions: { [key: string]: Result<unknown, unknown> } = {};

  for (const commandOption of command.options) {
    const inputOption =
      options[commandOption.name as keyof ParseOptionsInput<SourceCommand>];

    if (!inputOption && commandOption.required) {
      return err(
        `Missing required argument ${commandOption.name} in ${command.name}`,
      );
    } else if (!inputOption) {
      resultOptions[commandOption.name] = ok(undefined);
      continue;
    }

    let value = inputOption;

    if (value === undefined || (Array.isArray(value) && value.length === 0)) {
      resultOptions[commandOption.name] = ok(undefined);
      continue;
    }

    if (commandOption.multiTransform) {
      const result = commandOption.multiTransform(
        (Array.isArray(value) ? value : [value]).map((v) => v),
        context,
      );

      resultOptions[commandOption.name] = await Promise.resolve(result);
    } else if (commandOption.transform) {
      if (Array.isArray(value)) {
        if (value.length === 1) {
          value = value[0];
        } else {
          return err(
            `Received invalid array input on single-transformer for ${commandOption.name} in ${command.name}`,
          );
        }
      }

      const transformResult = commandOption.transform(value, context);
      resultOptions[commandOption.name] =
        await Promise.resolve(transformResult);
    }
  }

  return ok(resultOptions as CommandOptionsResult<SourceCommand["options"]>);
}
