import {
  type AnySelectMenuInteraction,
  type BitFieldResolvable,
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type Client,
  Guild,
  type InteractionEditReplyOptions,
  type InteractionReplyOptions,
  type MessageFlags,
  MessagePayload,
  type ModalBuilder,
  type ModalSubmitInteraction,
  type User,
} from "discord.js";
import { type CommandOptionsResult } from "../../types/types.js";
import { type Command } from "./Command.js";

export class CommandContext<SourceCommand extends Command> {
  private client: Client;
  private interaction:
    | ChatInputCommandInteraction
    | ButtonInteraction
    | AnySelectMenuInteraction
    | ModalSubmitInteraction;

  public options: CommandOptionsResult<SourceCommand["options"]>;

  public user: User;
  public guild: Guild | null;

  constructor(
    interaction:
      | ChatInputCommandInteraction
      | ButtonInteraction
      | AnySelectMenuInteraction
      | ModalSubmitInteraction,
    options: CommandOptionsResult<SourceCommand["options"]>,
  ) {
    this.client = interaction.client;
    this.interaction = interaction;

    this.options = options;
    this.user = interaction.user;
    this.guild = interaction.guild;
  }

  public async deferEdit() {
    if (this.interaction.isChatInputCommand()) {
      await this.defer();
    } else {
      await this.interaction.deferUpdate();
    }

    return;
  }

  public async defer(
    flags?: BitFieldResolvable<"Ephemeral", MessageFlags.Ephemeral>,
  ) {
    if (this.interaction.deferred) {
      return;
    }

    await this.interaction.deferReply({ flags });
    return;
  }

  public async send(payload: InteractionReplyOptions) {
    if (this.interaction.deferred) {
      const message = await this.interaction.followUp(payload);
      return message;
    } else {
      const response = await this.interaction.reply(payload);
      const message = await response.fetch();
      return message;
    }
  }

  public async edit(payload: InteractionEditReplyOptions) {
    const normalizedPayload = new MessagePayload(this.interaction, payload);

    if (this.interaction.isModalSubmit() && !this.interaction.isFromMessage()) {
      await this.interaction.followUp(normalizedPayload);
    } else {
      await this.interaction.editReply(normalizedPayload);
    }
  }

  public async sendModal(modal: ModalBuilder) {
    if (
      this.interaction.isChatInputCommand() ||
      this.interaction.isAnySelectMenu() ||
      this.interaction.isButton()
    ) {
      await this.interaction.showModal(modal);
    }
  }
}
