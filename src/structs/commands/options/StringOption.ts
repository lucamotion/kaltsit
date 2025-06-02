import { ApplicationCommandOptionType } from "discord.js";
import { Ok } from "neverthrow";
import {
  AsyncMultiTransformer,
  AsyncSingleTransformer,
  type MultiTransformer,
  type SingleTransformer,
} from "../../../types/types.js";
import { CommandOption } from "./CommandOption.js";

export class CommandStringOption<
  Name extends string,
  Required extends boolean = false,
  TransformType extends
    | (SingleTransformer<string> | AsyncSingleTransformer<string>)
    | undefined = (value: string) => Ok<string, never>,
  MultiTransformType extends
    | (MultiTransformer<Array<string>> | AsyncMultiTransformer<Array<string>>)
    | undefined = undefined,
> extends CommandOption<Name, Required, TransformType, MultiTransformType> {
  type = ApplicationCommandOptionType.String as const;

  declare useTransformer: <
    NewTransform extends SingleTransformer | AsyncSingleTransformer,
  >(
    transformer: NewTransform,
  ) => CommandStringOption<Name, Required, NewTransform, undefined>;

  declare useMultiTransformer: <
    NewTransform extends MultiTransformer | AsyncMultiTransformer,
  >(
    multiTransformer: NewTransform,
  ) => CommandStringOption<Name, Required, undefined, NewTransform>;
}
