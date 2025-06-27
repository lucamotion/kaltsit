import { ApplicationCommandOptionType } from "discord.js";
import { Ok } from "neverthrow";
import {
  AsyncMultiTransformer,
  AsyncSingleTransformer,
  type MultiTransformer,
  type SingleTransformer,
} from "../../../types/types.js";
import { BaseOption } from "./BaseOption.js";

export class BooleanOption<
  Name extends string,
  Required extends boolean = false,
  Internal extends boolean = false,
  TransformType extends
    | (SingleTransformer<boolean> | AsyncSingleTransformer<boolean>)
    | undefined = (value: boolean) => Ok<boolean, never>,
  MultiTransformType extends
    | (MultiTransformer<Array<boolean>> | AsyncMultiTransformer<Array<boolean>>)
    | undefined = undefined,
> extends BaseOption<
  Name,
  Required,
  Internal,
  TransformType,
  MultiTransformType
> {
  type = ApplicationCommandOptionType.Boolean as const;

  declare useTransformer: <
    NewTransform extends
      | SingleTransformer<boolean>
      | AsyncSingleTransformer<boolean>,
  >(
    transformer: NewTransform,
  ) => BooleanOption<Name, Required, Internal, NewTransform, undefined>;

  declare useMultiTransformer: <
    NewTransform extends
      | MultiTransformer<Array<boolean>>
      | AsyncMultiTransformer<Array<boolean>>,
  >(
    multiTransformer: NewTransform,
  ) => BooleanOption<Name, Required, Internal, undefined, NewTransform>;
}
