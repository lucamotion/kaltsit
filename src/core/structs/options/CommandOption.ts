import {
  APIApplicationCommandBasicOption,
  ApplicationCommandOptionBase,
  ApplicationCommandOptionType,
} from "discord.js";
import { MultiTransformer, SingleTransformer } from "../../../types/types.js";

export class CommandOption<
  Name extends string,
  Required extends boolean = false,
  TransformType extends SingleTransformer | undefined = undefined,
  MultiTransformType extends MultiTransformer | undefined = undefined,
> extends ApplicationCommandOptionBase {
  readonly name: Name;
  readonly required: Required;
  transform: TransformType = undefined as TransformType;
  multiTransform: MultiTransformType = undefined as MultiTransformType;
  type!: ApplicationCommandOptionType;

  constructor(name: Name, required?: Required) {
    super();
    this.name = name;
    this.required = required || (false as Required);
  }

  useTransformer = <NewTransform extends SingleTransformer>(
    transformer: NewTransform,
  ): CommandOption<Name, Required, NewTransform, undefined> => {
    this.multiTransform = undefined as MultiTransformType;
    this.transform = transformer as unknown as TransformType;
    return this as unknown as CommandOption<
      Name,
      Required,
      NewTransform,
      undefined
    >;
  };

  useMultiTransformer = <NewTransform extends MultiTransformer>(
    multiTransformer: NewTransform,
  ): CommandOption<Name, Required, undefined, NewTransform> => {
    this.multiTransform = multiTransformer as unknown as MultiTransformType;
    this.transform = undefined as TransformType;
    return this as unknown as CommandOption<
      Name,
      Required,
      undefined,
      NewTransform
    >;
  };

  toJSON(): APIApplicationCommandBasicOption {
    return { ...(this as APIApplicationCommandBasicOption) };
  }
}
