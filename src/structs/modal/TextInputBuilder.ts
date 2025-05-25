import { TextInputBuilder as DjsTextInputBuilder } from "discord.js";
import { Command } from "../commands/Command.js";

export class TextInputBuilder<
  SourceCommand extends Command,
> extends DjsTextInputBuilder {
  setCustomId(overwrites: SourceCommand["options"][number]["name"]) {
    this.data.custom_id = overwrites;
    return this;
  }
}
