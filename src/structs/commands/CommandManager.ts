import { AnyCommand } from "../../types/types.js";
import { Command } from "./Command.js";
import { CommandWithSubcommandGroups } from "./CommandWithSubcommandGroups.js";
import { CommandWithSubcommands } from "./CommandWithSubcommands.js";

type CommandArray = ReadonlyArray<AnyCommand>;
type CmdRecord<Arr extends CommandArray> = {
  [Command in Arr[number] as Command["name"]]: Command;
};

export class CommandManager<
  Commands extends CommandArray = CommandArray,
  CommandRecord extends Record<
    string,
    AnyCommand | undefined
  > = CmdRecord<Commands>,
  CommandName extends Extract<keyof CommandRecord, string> = Extract<
    keyof CommandRecord,
    string
  >,
> {
  private commands: Commands;
  private commandRecord: CommandRecord;
  private commandIdRecord: {
    [key: string]: Command<string> | undefined;
  };

  constructor(commands: Commands) {
    this.commands = commands;
    this.commandRecord = commands.reduce((record, command) => {
      if (record[command.name]) {
        console.warn(`Duplicate commands found at ${command.name}`);
        return record;
      }

      return { ...record, [command.name]: command };
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
        {} as { [key: string]: Command<string> | undefined },
      );
  }

  public isCommandName(name: string): name is CommandName {
    return this.commandRecord[name] !== undefined;
  }

  public getCommand<T extends CommandName>(name: T): CommandRecord[T] {
    return this.commandRecord[name];
  }

  public getAllCommands(): Commands {
    return this.commands;
  }

  public resolve(
    commandPath: [string | undefined, string | undefined, string],
  ): Command<string> | undefined {
    const groupName = commandPath[0];
    const subcommandName = commandPath[1];
    const commandName = commandPath[2];

    if (!groupName && !subcommandName) {
      return this.commandRecord[commandName] as Command<string>;
    }

    if (!groupName && subcommandName) {
      const subcommand = this.commandRecord[subcommandName];

      if (subcommand instanceof CommandWithSubcommands) {
        return subcommand.commands.find((c) => c.name === commandName);
      } else {
        return;
      }
    }

    if (!groupName) {
      return;
    }

    const subcommandGroup = this.commandRecord[groupName];

    if (subcommandGroup instanceof CommandWithSubcommandGroups) {
      const subcommand = subcommandGroup.subcommandGroups.find(
        (c) => c.name === subcommandName,
      );

      if (subcommand instanceof CommandWithSubcommands) {
        return subcommand.commands.find((c) => c.name === commandName);
      }
    }

    return;
  }

  public resolveById(id: string): Command<string> | undefined {
    return this.commandIdRecord[id];
  }
}
