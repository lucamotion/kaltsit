import { type Command } from "../structs/commands/Command.js";
import { type ParseOptionsInput } from "../types/types.js";

export const dataStore: Map<string, ParseOptionsInput<Command>> = new Map();
