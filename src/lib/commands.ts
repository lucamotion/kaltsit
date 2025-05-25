import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import { err, ok, type Result } from "neverthrow";
import { type Command } from "../structs/commands/Command.js";
import { CommandWithSubcommandGroups } from "../structs/commands/CommandWithSubcommandGroups.js";
import { CommandWithSubcommands } from "../structs/commands/CommandWithSubcommands.js";
import {
  type AnyCommand,
  type CommandOptionsResult,
  type ParseOptionsInput,
} from "../types/types.js";

export function transformCommands(
  commands: Array<AnyCommand> | ReadonlyArray<AnyCommand>,
) {
  return commands.map((command) => {
    if (command instanceof CommandWithSubcommandGroups) {
      return {
        type: ApplicationCommandType.ChatInput,
        name: command.name,
        description: command.description,
        options: command.subcommandGroups.map((group) => ({
          type: ApplicationCommandOptionType.SubcommandGroup,
          name: group.name,
          description: group.description,
          options: group.commands.map((subcommand) => ({
            type: ApplicationCommandOptionType.Subcommand,
            name: subcommand.name,
            description: subcommand.description,
            options: subcommand.options.map((option) => option.toJSON()),
          })),
        })),
      } satisfies RESTPostAPIChatInputApplicationCommandsJSONBody;
    } else if (command instanceof CommandWithSubcommands) {
      return {
        type: ApplicationCommandType.ChatInput,
        name: command.name,
        description: command.description,
        options: command.commands.map((subcommand) => ({
          type: ApplicationCommandOptionType.Subcommand,
          name: subcommand.name,
          description: subcommand.description,
          options: subcommand.options.map((option) => option.toJSON()),
        })),
      } satisfies RESTPostAPIChatInputApplicationCommandsJSONBody;
    } else {
      return {
        type: ApplicationCommandType.ChatInput,
        name: command.name,
        description: command.description,
        options: command.options.map((option) => option.toJSON()),
      } satisfies RESTPostAPIChatInputApplicationCommandsJSONBody;
    }
  });
}

export async function parseOptions<SourceCommand extends Command>(
  command: SourceCommand,
  options: ParseOptionsInput<SourceCommand>,
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
        (Array.isArray(value) ? value : [value]).map((v) => v.toString()),
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

      const transformResult = commandOption.transform(value.toString());
      resultOptions[commandOption.name] =
        await Promise.resolve(transformResult);
    }
  }

  return ok(resultOptions as CommandOptionsResult<SourceCommand["options"]>);
}
