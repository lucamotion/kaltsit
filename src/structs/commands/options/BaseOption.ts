import {
  type APIApplicationCommandBasicOption,
  ApplicationCommandOptionBase,
  type ApplicationCommandOptionType,
} from "discord.js";
import { ok, Ok } from "neverthrow";
import type {
  AsyncMultiTransformer,
  AsyncSingleTransformer,
  MultiTransformer,
  SingleTransformer,
} from "../../../types/types.js";
import { TransformerContext } from "../TransformerContext.js";

export class BaseOption<
  Name extends string,
  Required extends boolean = false,
  Internal extends boolean = false,
  TransformType extends
    | (SingleTransformer<any> | AsyncSingleTransformer<any>)
    | undefined = (value: string) => Ok<string, never>,
  MultiTransformType extends
    | (MultiTransformer<Array<any>> | AsyncMultiTransformer<Array<any>>)
    | undefined = undefined,
> extends ApplicationCommandOptionBase {
  readonly name: Name;
  readonly required: Required;
  transform: TransformType = ((value: string, ctx: TransformerContext) =>
    ok(value)) as TransformType;
  multiTransform: MultiTransformType = undefined as MultiTransformType;
  type!: ApplicationCommandOptionType;
  internal: boolean = false;

  constructor(name: Name, required?: Required) {
    super();
    this.name = name;
    this.required = required || (false as Required);
  }

  useTransformer = <
    NewTransform extends
      | SingleTransformer<any, any>
      | AsyncSingleTransformer<any, any>,
  >(
    transformer: NewTransform,
  ): BaseOption<Name, Required, Internal, NewTransform, undefined> => {
    this.multiTransform = undefined as MultiTransformType;
    this.transform = transformer as unknown as TransformType;
    return this as unknown as BaseOption<
      Name,
      Required,
      Internal,
      NewTransform,
      undefined
    >;
  };

  useMultiTransformer = <
    NewTransform extends
      | MultiTransformer<any, any>
      | AsyncMultiTransformer<any, any>,
  >(
    multiTransformer: NewTransform,
  ): BaseOption<Name, Required, Internal, undefined, NewTransform> => {
    this.multiTransform = multiTransformer as unknown as MultiTransformType;
    this.transform = undefined as TransformType;
    return this as unknown as BaseOption<
      Name,
      Required,
      Internal,
      undefined,
      NewTransform
    >;
  };

  setInternal = <NewInternal extends Required extends true ? false : boolean>(
    internal: NewInternal,
  ) => {
    this.internal = internal;
    return this as BaseOption<
      Name,
      Required,
      NewInternal,
      TransformType,
      MultiTransformType
    >;
  };

  toJSON(): APIApplicationCommandBasicOption {
    return { ...(this as APIApplicationCommandBasicOption) };
  }
}
