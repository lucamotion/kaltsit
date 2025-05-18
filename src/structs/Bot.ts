import { Client, ClientOptions, MessageFlags, Routes } from "discord.js";
import { parseOptions, transformCommands } from "../lib/commands.js";
import { Command, dataStore, TexasError } from "../main.js";
import { AnyCommand, ParseOptionsInput } from "../types/types.js";
import { CommandContext } from "./CommandContext.js";
import { CommandManager } from "./CommandManager.js";

export class Bot<
  Commands extends ReadonlyArray<AnyCommand> = ReadonlyArray<AnyCommand>,
> extends Client {
  commandManager: CommandManager<Commands>;

  public async connect(): Promise<string> {
    const token = process.env.DISCORD_TOKEN;

    if (!token) {
      throw new Error("DISCORD_TOKEN must be specified in .env!");
    }

    const clientId = process.env.CLIENT_ID;
    const isProduction = process.env.NODE_ENV === "production";
    const devGuildId = process.env.DEVELOPMENT_GUILD_ID;

    if (!clientId) {
      throw new Error("CLIENT_ID must be specified in .env!");
    } else if (!isProduction && !devGuildId) {
      throw new Error(
        "DEVELOPMENT_GUILD_ID must be specified in .env if NODE_ENV != 'production'!",
      );
    }

    this.once("ready", () => {
      console.log(
        `Bot authenticated as ${this.user?.username}#${this.user?.discriminator}`,
      );

      const commands = transformCommands(this.commandManager.getAllCommands());
      const commandRoute = isProduction
        ? Routes.applicationCommands(clientId)
        : Routes.applicationGuildCommands(clientId, devGuildId!);

      this.rest.put(commandRoute, { body: commands }).catch((e) => {
        console.error(`Failed to PUT application commands:`, e);
      });
    });

    this.on("interactionCreate", async (interaction) => {
      if (interaction.isAutocomplete() || interaction.isContextMenuCommand()) {
        return;
      }

      let command;
      let rawOptions;

      if (interaction.isModalSubmit()) {
        const [commandId, uuid] = interaction.customId.split(":");

        const data = dataStore.get(uuid);

        command = this.commandManager.resolveById(commandId);
        rawOptions = data;

        if (rawOptions) {
          for (const component of interaction.components[0].components) {
            rawOptions[component.customId] = component.value;
          }
        }
      } else if (interaction.isMessageComponent()) {
        const [commandId, uuid] = interaction.customId.split(":");

        const data = dataStore.get(uuid);

        command = this.commandManager.resolveById(commandId);
        rawOptions = data;

        if (interaction.isAnySelectMenu()) {
          const overwrites = data?.overwrites?.toString();

          if (rawOptions && overwrites) {
            rawOptions[overwrites] = interaction.values;
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

        command = this.commandManager.resolve(commandPath);

        const interactionOptionsRecord = interactionOptions.reduce(
          (record, option) => {
            return { ...record, [option.name]: option.value?.toString() };
          },
          {} as ParseOptionsInput<Command<string>>,
        );

        rawOptions = interactionOptionsRecord;
      }

      if (!command || !rawOptions) {
        return;
      }

      const parsedOptions = await parseOptions(command, rawOptions);

      if (parsedOptions.isErr()) {
        await interaction.reply({
          content: "An unexpected error occurred",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      const commandContext = new CommandContext(
        interaction,
        parsedOptions.value,
      );

      for (const precondition of command.preconditions) {
        const result = await precondition(commandContext);

        if (result.isErr()) {
          const error = result.error;

          if (error instanceof TexasError) {
            await interaction.reply({ content: error.message });
          }

          return;
        }
      }

      await command.execute(commandContext);
    });

    await this.login(token);
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
