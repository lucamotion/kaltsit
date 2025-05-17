import { Client, ClientOptions, MessageFlags, Routes } from "discord.js";
import { parseOptions, transformCommands } from "../../lib/commands.js";
import { Command, dataStore } from "../../main.js";
import { AnyCommand, ParseOptionsInput } from "../../types/types.js";
import { CommandContext } from "./CommandContext.js";
import { CommandManager } from "./CommandManager.js";

export class Bot<
  Commands extends ReadonlyArray<AnyCommand> = ReadonlyArray<AnyCommand>,
> extends Client {
  commandManager: CommandManager<Commands>;

  public async connect(token: string): Promise<string> {
    this.once("ready", () => {
      this.rest
        .put(
          Routes.applicationGuildCommands(
            "1370607904532594758",
            "1370605527435841596",
          ),
          { body: transformCommands(this.commandManager.getAllCommands()) },
        )
        .catch((e) => {
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
