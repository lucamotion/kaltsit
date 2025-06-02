import {
  type AnyCommand,
  type CommandRecordWithPaths,
} from "../../types/types.js";
import { Command } from "./Command.js";
import { CommandWithSubcommandGroups } from "./CommandWithSubcommandGroups.js";
import { CommandWithSubcommands } from "./CommandWithSubcommands.js";

type CommandArray = ReadonlyArray<AnyCommand>;

export class CommandManager<
  Commands extends CommandArray = CommandArray,
  CommandRecord extends
    CommandRecordWithPaths<Commands> = CommandRecordWithPaths<Commands>,
  CommandPath extends Extract<keyof CommandRecord, string> = Extract<
    keyof CommandRecord,
    string
  >,
> {
  public readonly commands: Commands;
  private commandRecord: CommandRecord;
  private commandIdRecord: {
    [key: string]: Command | undefined;
  };

  constructor(commands: Commands) {
    this.commands = commands;
    this.commandRecord = commands.reduce((record, command) => {
      const recordToMerge: { [key: string]: AnyCommand } = {};

      if (command instanceof Command) {
        recordToMerge[command.name] = command;
      } else if (command instanceof CommandWithSubcommands) {
        recordToMerge[command.name] = command;

        for (const subcommand of command.commands) {
          recordToMerge[`${command.name}.${subcommand.name}`] = subcommand;
        }
      } else if (command instanceof CommandWithSubcommandGroups) {
        recordToMerge[command.name] = command;
        for (const group of command.subcommandGroups) {
          recordToMerge[group.name] = group;
          for (const subcommand of group.commands) {
            recordToMerge[`${group.name}.${subcommand.name}`] = subcommand;
          }
        }
      }

      for (const key in recordToMerge) {
        if (record[key as keyof typeof record]) {
          console.warn(
            `Duplicate command found at ${key}. The full command tree will be skipped.`,
          );
          continue;
        }
      }

      return { ...record, ...recordToMerge };
    }, {} as CommandRecord);
    this.commandIdRecord = commands
      .map((command) => {
        if (command instanceof Command) {
          return command;
        } else if (command instanceof CommandWithSubcommands) {
          return command.commands;
        } else {
          return command.subcommandGroups.map((group) => group.commands);
        }
      })
      .flat(2)
      .reduce(
        (record, command) => {
          return { ...record, [command.id]: command };
        },
        {} as { [key: string]: Command | undefined },
      );
  }

  public isCommandPath(path: string): path is CommandPath {
    return this.commandRecord[path as CommandPath] !== undefined;
  }

  public getCommand<T extends CommandPath>(path: T): CommandRecord[T] {
    return this.commandRecord[path];
  }

  public getAllCommands(): Commands {
    return this.commands;
  }

  public resolveById(id: string): Command | undefined {
    return this.commandIdRecord[id];
  }
}
