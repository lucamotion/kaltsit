export abstract class BaseCommand {
  abstract readonly name: Readonly<string>;
  abstract description: string;
}
