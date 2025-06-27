import {
  ApplicationCommandOptionType,
  AutocompleteFocusedOption,
} from "discord.js";
import { Ok } from "neverthrow";
import {
  AsyncMultiTransformer,
  AsyncSingleTransformer,
  type MultiTransformer,
  type SingleTransformer,
} from "../../../types/types.js";
import { TransformerContext } from "../TransformerContext.js";
import { BaseOption } from "./BaseOption.js";

export class StringOption<
  Name extends string,
  Required extends boolean = false,
  Internal extends boolean = false,
  TransformType extends
    | (SingleTransformer<string> | AsyncSingleTransformer<string>)
    | undefined = (value: string) => Ok<string, never>,
  MultiTransformType extends
    | (MultiTransformer<Array<string>> | AsyncMultiTransformer<Array<string>>)
    | undefined = undefined,
> extends BaseOption<
  Name,
  Required,
  Internal,
  TransformType,
  MultiTransformType
> {
  type = ApplicationCommandOptionType.String as const;
  autocomplete: boolean = false;
  executeAutocomplete?: (
    ctx: TransformerContext,
    value: AutocompleteFocusedOption,
  ) => Promise<Array<{ name: string; value: string }>>;

  declare useTransformer: <
    NewTransform extends
      | SingleTransformer<string>
      | AsyncSingleTransformer<string>,
  >(
    transformer: NewTransform,
  ) => StringOption<Name, Required, Internal, NewTransform, undefined>;

  declare useMultiTransformer: <
    NewTransform extends
      | MultiTransformer<Array<string>>
      | AsyncMultiTransformer<Array<string>>,
  >(
    multiTransformer: NewTransform,
  ) => StringOption<Name, Required, Internal, undefined, NewTransform>;

  useAutocomplete(
    autocomplete: (
      ctx: TransformerContext,
      option: AutocompleteFocusedOption,
    ) => Promise<Array<{ name: string; value: string }>>,
  ) {
    this.executeAutocomplete = autocomplete;
    this.autocomplete = true;
    return this;
  }
}
