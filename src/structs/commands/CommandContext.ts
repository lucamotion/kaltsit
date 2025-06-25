import {
  type AnySelectMenuInteraction,
  type BitFieldResolvable,
  type ButtonInteraction,
  type ChatInputCommandInteraction,
  type Client,
  Guild,
  type InteractionEditReplyOptions,
  type InteractionReplyOptions,
  Message,
  type MessageFlags,
  MessagePayload,
  MessageResolvable,
  type ModalBuilder,
  type ModalSubmitInteraction,
  type User,
} from "discord.js";
import { err, ok, Result } from "neverthrow";
import { type CommandOptionsResult } from "../../types/types.js";
import { type Command } from "./Command.js";

export class CommandContext<SourceCommand extends Command> {
  private client: Client;
  public interaction:
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

  public async deferEdit(): Promise<Result<void, Error>> {
    try {
      if (this.interaction.isChatInputCommand()) {
        await this.defer();
        return ok();
      } else {
        await this.interaction.deferUpdate();
        return ok();
      }
    } catch (e) {
      if (e instanceof Error) {
        return err(e);
      } else {
        console.error(e);
        return err(
          new Error(
            "An unexpected error occurred. It has been logged to the console.",
          ),
        );
      }
    }
  }

  public async defer(
    flags?: BitFieldResolvable<"Ephemeral", MessageFlags.Ephemeral>,
  ): Promise<Result<void, Error>> {
    if (this.interaction.deferred) {
      return ok();
    }

    try {
      await this.interaction.deferReply({ flags });
      return ok();
    } catch (e) {
      if (e instanceof Error) {
        return err(e);
      } else {
        console.error(e);
        return err(
          new Error(
            "An unexpected error occurred. It has been logged to the console.",
          ),
        );
      }
    }
  }

  public async send(
    payload: InteractionReplyOptions,
  ): Promise<Result<Message<boolean>, Error>> {
    try {
      if (this.interaction.deferred) {
        const message = await this.interaction.followUp(payload);
        return ok(message);
      } else {
        const response = await this.interaction.reply(payload);
        const message = await response.fetch();
        return ok(message);
      }
    } catch (e) {
      if (e instanceof Error) {
        return err(e);
      } else {
        console.error(e);
        return err(
          new Error(
            "An unexpected error occurred. It has been logged to the console.",
          ),
        );
      }
    }
  }

  public async edit(
    payload: InteractionEditReplyOptions,
  ): Promise<Result<void, Error>> {
    const normalizedPayload = new MessagePayload(this.interaction, payload);

    try {
      if (
        this.interaction.isModalSubmit() &&
        !this.interaction.isFromMessage()
      ) {
        await this.interaction.followUp(normalizedPayload);
        return ok();
      } else {
        if (this.interaction.deferred) {
          await this.interaction.editReply(normalizedPayload);
        } else {
          if (
            this.interaction.isMessageComponent() ||
            this.interaction.isModalSubmit()
          ) {
            await this.interaction.deferUpdate();
            await this.interaction.editReply({
              ...payload,
              message: this.interaction.message,
            });
          } else {
            // ???
          }
        }
        return ok();
      }
    } catch (e) {
      if (e instanceof Error) {
        return err(e);
      } else {
        console.error(e);
        return err(
          new Error(
            "An unexpected error occurred. It has been logged to the console.",
          ),
        );
      }
    }
  }

  public async editElseSend(
    payload: InteractionEditReplyOptions,
  ): Promise<Result<void, Error>> {
    const normalizedPayload = new MessagePayload(this.interaction, payload);

    try {
      if (this.interaction.isMessageComponent()) {
        if (!this.interaction.deferred) {
          await this.interaction.deferUpdate();
          await this.interaction.editReply(normalizedPayload);
        } else {
          await this.interaction.followUp(normalizedPayload);
        }
      } else {
        if (!this.interaction.deferred) {
          await this.interaction.reply(normalizedPayload);
        } else {
          await this.interaction.followUp(normalizedPayload);
        }
      }
      return ok();
    } catch (e) {
      if (e instanceof Error) {
        return err(e);
      } else {
        console.error(e);
        return err(
          new Error(
            "An unexpected error occurred. It has been logged to the console.",
          ),
        );
      }
    }
  }

  public async sendModal(modal: ModalBuilder): Promise<Result<void, Error>> {
    try {
      if (
        this.interaction.isChatInputCommand() ||
        this.interaction.isAnySelectMenu() ||
        this.interaction.isButton()
      ) {
        await this.interaction.showModal(modal);
        return ok();
      } else {
        return err(
          new Error(
            `Cannot send modal on incompatible interaction type ${this.interaction.type}`,
          ),
        );
      }
    } catch (e) {
      if (e instanceof Error) {
        return err(e);
      } else {
        console.error(e);
        return err(
          new Error(
            "An unexpected error occurred. It has been logged to the console.",
          ),
        );
      }
    }
  }

  public async delete(reply?: MessageResolvable): Promise<Result<void, Error>> {
    try {
      await this.interaction.deleteReply(reply);
      return ok();
    } catch (e) {
      console.error(e);
      return err(
        new Error(
          "An unexpected error occurred. It has been logged to the console.",
        ),
      );
    }
  }
}
