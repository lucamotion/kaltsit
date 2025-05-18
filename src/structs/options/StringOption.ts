import { ApplicationCommandOptionType } from "discord.js";
import { MultiTransformer, SingleTransformer } from "../../types/types.js";
import { CommandOption } from "./CommandOption.js";

export class CommandStringOption<
  Name extends string,
  Required extends boolean = false,
  TransformType extends SingleTransformer | undefined = undefined,
  MultiTransformType extends MultiTransformer | undefined = undefined,
> extends CommandOption<Name, Required, TransformType, MultiTransformType> {
  type = ApplicationCommandOptionType.String as const;

  declare useTransformer: <NewTransform extends SingleTransformer>(
    transformer: NewTransform,
  ) => CommandStringOption<Name, Required, NewTransform, undefined>;

  declare useMultiTransformer: <NewTransform extends MultiTransformer>(
    multiTransformer: NewTransform,
  ) => CommandStringOption<Name, Required, undefined, NewTransform>;
}
