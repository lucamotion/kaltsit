export abstract class BaseCommand<Name> {
  name: Name;
  abstract description: string;

  constructor(name: Name) {
    this.name = name;
  }
}
