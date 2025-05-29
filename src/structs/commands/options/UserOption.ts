import { ApplicationCommandOptionType } from "discord.js";
import {
  type MultiTransformer,
  type SingleTransformer,
} from "../../../types/types.js";
import { CommandOption } from "./CommandOption.js";

export class UserOption<
  Name extends string,
  Required extends boolean = false,
  TransformType extends SingleTransformer | undefined = undefined,
  MultiTransformType extends MultiTransformer | undefined = undefined,
> extends CommandOption<Name, Required, TransformType, MultiTransformType> {
  type = ApplicationCommandOptionType.User as const;

  declare useTransformer: <NewTransform extends SingleTransformer>(
    transformer: NewTransform,
  ) => UserOption<Name, Required, NewTransform, undefined>;

  declare useMultiTransformer: <NewTransform extends MultiTransformer>(
    multiTransformer: NewTransform,
  ) => UserOption<Name, Required, undefined, NewTransform>;
}
