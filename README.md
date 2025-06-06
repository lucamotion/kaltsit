# kaltsit

An opinionated Discord bot framework where _everything_ is a command. Pronounced "cal-sit."

Currently, Kaltsit only supports slash commands. Legacy message commands are not supported.

## Documentation

TODO

## Features

### Command Management

Kaltsit provides a `CommandManager` class which commands must be registered to. TypeScript will be aware of the commands registered to it, so full autocomplete support and type safety is provided when retrieving commands.

```typescript
const commands = [new TestCommand()];
const commandManager = new CommandManager(commands);

const testCommand = commandManager.getCommand("test");
// ✅ Returns TestCommand
const invalidCommand = commandManager.getCommand("invalid");
// ❌ TypeError!
```

Members of subcommands and subcommand groups can be retrieved via paths in the format `group.subcommand.command`.

### Interactions

Kaltsit automatically routes all interactions, and supports slash commands (obviously), buttons, select menus, modals, and autocomplete. Context menu interactions are not supported at this time.

Like the tagline says, everything is a command, so Kaltsit does not have _interaction handlers_ per se. Instead, component and modal interactions execute commands. To facilitate this, you are able to provide all the input options of the command to be executed. This allows you to easily create repetitive flows such as confirmation or pagination without needing to write tons of boilerplate.

The `ComponentCommand` and `ComponentSubcommand` classes are provided for commands you wish to be able to execute via component but not via slash command.

### Transformers

Often, you will run into scenarios where the value of a command option needs to be processed to get what you _really_ want. Transformers provide a portable, reusable, and type-safe way to share this logic between many commands - don't repeat yourself!

To illustrate this, suppose you are developing a game in a Discord bot. You want to add a `/profile` command that displays player data beyond what the Discord API provides. Normally, you would need to provide a `UserOption` and fetch the player's data from the `User`'s ID in your command execution code.

With transformers, you can move that fetching from the command to the option:

```ts
async function playerTransformer(userResolvable: UserResolvable) {
  const player = await userRepository.getPlayer(userResolvable.toString());

  if (player === null) {
    return err(new Error(`Player ${userResolvable} not found`));
  }

  return ok(player);
}

new UserOption("player", true).useTransformer(playerTransformer);
```

Not only can you now easily transform a User to a Player, but the value in `CommandContext.options` will also correctly reflect the output of the transformer - it will be typed `Player` instead of `UserResolvable`.

### Preconditions

Preconditions are functions that run before a command's `execute()` function that must evaluate to `true` for the user to be able to execute the command.

### Command Context Mutation

You may want to pass more context to your commands than what Kaltsit provides by default. You can do this via augmenting the `kaltsit` module and providing a context mutator to your `Bot` class:

```ts
// types.d.ts
declare module "kaltsit" {
  interface CommandContext<SourceCommand extends Command> {
    player: Player | null;
  }
}
```

```ts
// main.ts
const bot = new Bot({ intents: [] }, commandManager).useContextMutator(
  async (context) => {
    const player = await userRepository.getPlayer(context.user.id);
    context.player = player;

    return context;
  },
);
```

## Caveats

- For TypeScript to correctly infer the names of your commands, the `name` property must be marked `readonly` or `as const`. In the future, an ESLint rule will be published to assist you with this since this is not (to my knowledge) enforceable with TypeScript alone. Please feel free to open a PR if I'm incorrect.
