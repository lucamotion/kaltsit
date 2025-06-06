import { ApplicationCommandOptionType } from "discord.js";
import { Ok } from "neverthrow";
import {
  AsyncMultiTransformer,
  AsyncSingleTransformer,
  type MultiTransformer,
  type SingleTransformer,
} from "../../../types/types.js";
import { CommandOption } from "./CommandOption.js";

export class BooleanOption<
  Name extends string,
  Required extends boolean = false,
  TransformType extends
    | (SingleTransformer<boolean> | AsyncSingleTransformer<boolean>)
    | undefined = (value: boolean) => Ok<boolean, never>,
  MultiTransformType extends
    | (MultiTransformer<Array<boolean>> | AsyncMultiTransformer<Array<boolean>>)
    | undefined = undefined,
> extends CommandOption<Name, Required, TransformType, MultiTransformType> {
  type = ApplicationCommandOptionType.Boolean as const;

  declare useTransformer: <
    NewTransform extends
      | SingleTransformer<boolean>
      | AsyncSingleTransformer<boolean>,
  >(
    transformer: NewTransform,
  ) => BooleanOption<Name, Required, NewTransform, undefined>;

  declare useMultiTransformer: <
    NewTransform extends
      | MultiTransformer<Array<boolean>>
      | AsyncMultiTransformer<Array<boolean>>,
  >(
    multiTransformer: NewTransform,
  ) => BooleanOption<Name, Required, undefined, NewTransform>;
}
