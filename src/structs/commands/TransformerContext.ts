import { type Client, Guild, type User } from "discord.js";

export class TransformerContext {
  private client: Client<true>;
  public user: User;
  public guild: Guild | null;

  constructor(client: Client<true>, user: User, guild: Guild) {
    this.client = client;
    this.user = user;
    this.guild = guild;
  }
}
