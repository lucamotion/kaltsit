import {
  ApplicationCommandOptionType,
  Client,
  type ClientOptions,
  MessageFlags,
  Routes,
} from "discord.js";
import { parseOptions, transformCommands } from "../lib/commands.js";
import { dataStore, UserOption } from "../main.js";
import {
  type AnyCommand,
  type ContextMutator,
  type ParseOptionsInput,
} from "../types/types.js";
import { Command } from "./commands/Command.js";
import { CommandContext } from "./commands/CommandContext.js";
import { type CommandManager } from "./commands/CommandManager.js";
import { RoleOption } from "./commands/options/RoleOption.js";
import { TransformerContext } from "./commands/TransformerContext.js";
import { KaltsitError } from "./error/KaltsitError.js";

export class Bot<
  Commands extends ReadonlyArray<AnyCommand> = ReadonlyArray<AnyCommand>,
  Ready extends boolean = false,
> extends Client<Ready> {
  commandManager: CommandManager<Commands>;

  private contextMutator: ContextMutator<Command> | undefined;

  public useContextMutator(mutator: ContextMutator<Command>) {
    this.contextMutator = mutator;
    return this;
  }

  public async connect(): Promise<string> {
    const token = process.env.DISCORD_TOKEN;

    if (!token) {
      throw new Error("DISCORD_TOKEN must be specified in .env!");
    }

    const isProduction = process.env.NODE_ENV === "production";
    const devGuildId = process.env.DEVELOPMENT_GUILD_ID;

    if (!isProduction && !devGuildId) {
      throw new Error(
        "DEVELOPMENT_GUILD_ID must be specified in .env if NODE_ENV != 'production'!",
      );
    }

    // wait for command registration before handling interactions
    await new Promise<void>((resolve, reject) => {
      this.once("ready", async (client) => {
        try {
          const commands = transformCommands(
            this.commandManager.getAllCommands(),
          );
          const commandRoute = isProduction
            ? Routes.applicationCommands(client.application.id)
            : Routes.applicationGuildCommands(
                client.application.id,
                devGuildId!,
              );

          await client.rest.put(commandRoute, { body: commands });
        } catch (error) {
          reject(error);
          process.exit(1);
        }

        resolve();
      });

      this.login(token).catch((error) => {
        reject(error);
        process.exit(1);
      });
    });

    const bot = this as Bot<Commands, true>;

    console.log(
      `Bot authenticated as ${bot.user.username}#${bot.user.discriminator}`,
    );

    bot.on("interactionCreate", async (interaction) => {
      if (interaction.isAutocomplete() || interaction.isContextMenuCommand()) {
        return;
      }

      let command: AnyCommand | undefined;
      let rawOptions: ParseOptionsInput<Command<any>> | undefined;

      if (interaction.isModalSubmit()) {
        const [commandId, uuid] = interaction.customId.split(":");

        const data = dataStore.get(uuid);

        command = bot.commandManager.resolveById(commandId);
        rawOptions = data;

        if (rawOptions) {
          for (const actionRow of interaction.components) {
            for (const component of actionRow.components) {
              rawOptions[component.customId] = component.value;
            }
          }
        }
      } else if (interaction.isMessageComponent()) {
        const [commandId, uuid] = interaction.customId.split(":");

        const data = dataStore.get(uuid);

        command = bot.commandManager.resolveById(commandId);
        rawOptions = data;

        if (interaction.isAnySelectMenu()) {
          const overwrites = data?.overwrites?.toString();

          if (rawOptions && overwrites) {
            const targetOption = command?.options.find(
              (option) => option.name === overwrites,
            );

            if (targetOption) {
              if (
                targetOption instanceof UserOption &&
                interaction.isUserSelectMenu()
              ) {
                rawOptions[overwrites] = interaction.users;
              } else if (
                targetOption instanceof RoleOption &&
                interaction.isRoleSelectMenu()
              ) {
                rawOptions[overwrites] = interaction.roles;
              } else {
                rawOptions[overwrites] = interaction.values;
              }
            } else {
              return;
            }
          }
        }
      } else if (interaction.isCommand()) {
        const subcommand = interaction.options.getSubcommand(false);
        const subcommandGroup = interaction.options.getSubcommandGroup(false);

        let commandPath: [string | undefined, string | undefined, string];
        let interactionOptions;

        if (!subcommand && !subcommandGroup) {
          commandPath = [undefined, undefined, interaction.commandName];
          interactionOptions = interaction.options.data;
        } else if (!subcommandGroup && subcommand) {
          commandPath = [undefined, interaction.commandName, subcommand];
          interactionOptions = interaction.options.data[0].options!;
        } else if (subcommandGroup && subcommand) {
          commandPath = [interaction.commandName, subcommandGroup, subcommand];
          interactionOptions = interaction.options.data[0].options![0].options!;
        } else {
          return;
        }

        const joinedPath = commandPath
          .filter((str) => str !== undefined)
          .join(".");

        if (!bot.commandManager.isCommandPath(joinedPath)) {
          return;
        }

        command = bot.commandManager.getCommand(joinedPath);

        if (!(command instanceof Command)) {
          return;
        }

        const interactionOptionsRecord = interactionOptions.reduce(
          (record, option) => {
            const sourceCommandOption = (command as Command).options.find(
              (opt) => opt.name === option.name,
            );

            if (!sourceCommandOption) {
              return record;
            }

            if (
              option.type === ApplicationCommandOptionType.User &&
              sourceCommandOption instanceof UserOption
            ) {
              return <ParseOptionsInput<Command>>{
                ...record,
                [option.name]: option.user,
              };
            } else if (
              option.type === ApplicationCommandOptionType.Role &&
              sourceCommandOption instanceof RoleOption
            ) {
              return <ParseOptionsInput<Command>>{
                ...record,
                [option.name]: option.role ?? undefined,
              };
            }

            return { ...record, [option.name]: option.value?.toString() };
          },
          {} as ParseOptionsInput<Command>,
        );

        rawOptions = interactionOptionsRecord;
      }

      if (!command || !(command instanceof Command) || !rawOptions) {
        return;
      }

      const context = new TransformerContext(
        bot,
        interaction.user,
        interaction.guild!,
      );
      const parsedOptions = await parseOptions(command, rawOptions, context);

      if (parsedOptions.isErr()) {
        await interaction.reply({
          content: "An unexpected error occurred",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      let commandContext = new CommandContext(interaction, parsedOptions.value);

      if (bot.contextMutator) {
        commandContext = await bot.contextMutator(commandContext);
      }

      for (const precondition of command.preconditions) {
        const result = await precondition(commandContext);

        if (result.isErr()) {
          const error = result.error;

          if (error instanceof KaltsitError) {
            await interaction.reply({ content: error.message });
          }

          return;
        }
      }

      await command.execute(commandContext);
    });

    return token;
  }

  constructor(
    options: ClientOptions,
    commandManager: CommandManager<Commands>,
  ) {
    super(options);
    this.commandManager = commandManager;
  }
}
