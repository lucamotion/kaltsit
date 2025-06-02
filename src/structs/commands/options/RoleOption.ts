import { ApplicationCommandOptionType, Role } from "discord.js";
import { Ok } from "neverthrow";
import {
  AsyncMultiTransformer,
  AsyncSingleTransformer,
  type MultiTransformer,
  type SingleTransformer,
} from "../../../types/types.js";
import { CommandOption } from "./CommandOption.js";

export class RoleOption<
  Name extends string,
  Required extends boolean = false,
  TransformType extends
    | (SingleTransformer<Role> | AsyncSingleTransformer<Role>)
    | undefined = (value: Role) => Ok<Role, never>,
  MultiTransformType extends
    | (MultiTransformer<Array<Role>> | AsyncMultiTransformer<Array<Role>>)
    | undefined = undefined,
> extends CommandOption<Name, Required, TransformType, MultiTransformType> {
  type = ApplicationCommandOptionType.Role as const;

  declare useTransformer: <
    NewTransform extends SingleTransformer<any> | AsyncSingleTransformer<any>,
  >(
    transformer: NewTransform,
  ) => RoleOption<Name, Required, NewTransform, undefined>;

  declare useMultiTransformer: <
    NewTransform extends MultiTransformer<any> | AsyncMultiTransformer<any>,
  >(
    multiTransformer: NewTransform,
  ) => RoleOption<Name, Required, undefined, NewTransform>;
}
