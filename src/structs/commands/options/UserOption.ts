import { ApplicationCommandOptionType, User } from "discord.js";
import { Ok } from "neverthrow";
import {
  AsyncMultiTransformer,
  AsyncSingleTransformer,
  type MultiTransformer,
  type SingleTransformer,
} from "../../../types/types.js";
import { CommandOption } from "./CommandOption.js";

export class UserOption<
  Name extends string,
  Required extends boolean = false,
  TransformType extends
    | (SingleTransformer<User> | AsyncSingleTransformer<User>)
    | undefined = (value: User) => Ok<User, never>,
  MultiTransformType extends
    | (MultiTransformer<Array<User>> | AsyncMultiTransformer<Array<User>>)
    | undefined = undefined,
> extends CommandOption<Name, Required, TransformType, MultiTransformType> {
  type = ApplicationCommandOptionType.User as const;

  declare useTransformer: <
    NewTransform extends SingleTransformer<User> | AsyncSingleTransformer<User>,
  >(
    transformer: NewTransform,
  ) => UserOption<Name, Required, NewTransform, undefined>;

  declare useMultiTransformer: <
    NewTransform extends
      | MultiTransformer<Array<User>>
      | AsyncMultiTransformer<Array<User>>,
  >(
    multiTransformer: NewTransform,
  ) => UserOption<Name, Required, undefined, NewTransform>;
}
