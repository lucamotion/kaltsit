import { ApplicationCommandOptionType } from "discord.js";
import { Ok } from "neverthrow";
import {
  AsyncMultiTransformer,
  AsyncSingleTransformer,
  type MultiTransformer,
  type SingleTransformer,
} from "../../../types/types.js";
import { BaseOption } from "./BaseOption.js";

export class NumberOption<
  Name extends string,
  Required extends boolean = false,
  Internal extends boolean = false,
  TransformType extends
    | (SingleTransformer<number> | AsyncSingleTransformer<number>)
    | undefined = (value: number) => Ok<number, never>,
  MultiTransformType extends
    | (MultiTransformer<Array<number>> | AsyncMultiTransformer<Array<number>>)
    | undefined = undefined,
> extends BaseOption<
  Name,
  Required,
  Internal,
  TransformType,
  MultiTransformType
> {
  type = ApplicationCommandOptionType.Number as const;

  declare useTransformer: <
    NewTransform extends
      | SingleTransformer<number>
      | AsyncSingleTransformer<number>,
  >(
    transformer: NewTransform,
  ) => NumberOption<Name, Required, Internal, NewTransform, undefined>;

  declare useMultiTransformer: <
    NewTransform extends
      | MultiTransformer<Array<number>>
      | AsyncMultiTransformer<Array<number>>,
  >(
    multiTransformer: NewTransform,
  ) => NumberOption<Name, Required, Internal, undefined, NewTransform>;
}
