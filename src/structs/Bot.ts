import {
  ApplicationCommandOptionType,
  Client,
  type ClientOptions,
  MessageFlags,
  Routes,
} from "discord.js";
import {
  parseOptions,
  resolveCommandFromInteraction,
  transformCommands,
} from "../lib/commands.js";
import { dataStore } from "../lib/dataStore.js";
import {
  type AnyCommand,
  type ContextMutator,
  type ParseOptionsInput,
} from "../types/types.js";
import { Command } from "./commands/Command.js";
import { CommandContext } from "./commands/CommandContext.js";
import { type CommandManager } from "./commands/CommandManager.js";
import { AttachmentOption } from "./commands/options/AttachmentOption.js";
import { BooleanOption } from "./commands/options/BooleanOption.js";
import { ChannelOption } from "./commands/options/ChannelOption.js";
import { NumberOption } from "./commands/options/NumberOption.js";
import { RoleOption } from "./commands/options/RoleOption.js";
import { StringOption } from "./commands/options/StringOption.js";
import { UserOption } from "./commands/options/UserOption.js";
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
    // avoids accidentally accepting to stale commands
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
          resolve();
        } catch (error) {
          reject(error);
          process.exit(1);
        }
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
      if (interaction.isContextMenuCommand()) {
        return;
      }

      let command: AnyCommand | undefined;
      let rawOptions: ParseOptionsInput<Command<any>> | undefined;

      if (interaction.isAutocomplete()) {
        const { path, options } = resolveCommandFromInteraction(interaction);

        if (!path || !bot.commandManager.isCommandPath(path)) {
          return;
        }

        command = bot.commandManager.getCommand(path);

        if (!(command instanceof Command)) {
          return;
        }

        const option = interaction.options.getFocused(true);

        const commandOption = command.options.find(
          (opt) => opt.name === option.name,
        );

        if (
          !(commandOption instanceof StringOption) ||
          !commandOption.autocomplete ||
          !commandOption.executeAutocomplete
        ) {
          return;
        }

        const results = await commandOption.executeAutocomplete(
          new TransformerContext(bot, interaction.user, interaction.guild!),
          option,
        );

        await interaction.respond(results);
        return;
      } else if (interaction.isModalSubmit()) {
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
        const { path, options } = resolveCommandFromInteraction(interaction);

        if (!path || !bot.commandManager.isCommandPath(path)) {
          return;
        }

        command = bot.commandManager.getCommand(path);

        if (!(command instanceof Command)) {
          return;
        }

        const interactionOptionsRecord = options.reduce((record, option) => {
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
          } else if (
            option.type === ApplicationCommandOptionType.Attachment &&
            sourceCommandOption instanceof AttachmentOption
          ) {
            return <ParseOptionsInput<Command>>{
              ...record,
              [option.name]: option.attachment,
            };
          } else if (
            option.type === ApplicationCommandOptionType.Channel &&
            sourceCommandOption instanceof ChannelOption
          ) {
            return <ParseOptionsInput<Command>>{
              ...record,
              [option.name]: option.channel,
            };
          } else if (
            option.type === ApplicationCommandOptionType.Boolean &&
            sourceCommandOption instanceof BooleanOption
          ) {
            return <ParseOptionsInput<Command>>{
              ...record,
              [option.name]: option.value,
            };
          } else if (
            option.type === ApplicationCommandOptionType.Number &&
            sourceCommandOption instanceof NumberOption
          ) {
            return <ParseOptionsInput<Command>>{
              ...record,
              [option.name]: option.value,
            };
          }
          return { ...record, [option.name]: option.value?.toString() };
        }, {} as ParseOptionsInput<Command>);

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
        } else if (result.value !== true) {
          // precondition did not pass, but precondition handled failure
          return;
        }
      }

      const result = await command.execute(commandContext);

      if (result.isOk()) {
        return;
      }

      const error = result.error;
      // TODO: proper error logging... maybe use an event handler?
      // commands should handle logic errors, etc. themselves,
      // so this should mostly be 4XX/5XX errors from discord
      console.error(error);
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
