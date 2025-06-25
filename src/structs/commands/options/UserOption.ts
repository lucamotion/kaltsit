import { ApplicationCommandOptionType, User, UserResolvable } from "discord.js";
import { err, ok, Result } from "neverthrow";
import {
  AsyncMultiTransformer,
  AsyncSingleTransformer,
  type MultiTransformer,
  type SingleTransformer,
} from "../../../types/types.js";
import { TransformerContext } from "../TransformerContext.js";
import { BaseOption } from "./BaseOption.js";

export class UserOption<
  Name extends string,
  Required extends boolean = false,
  TransformType extends
    | (
        | SingleTransformer<UserResolvable>
        | AsyncSingleTransformer<UserResolvable>
      )
    | undefined = AsyncSingleTransformer<UserResolvable, Result<User, Error>>,
  MultiTransformType extends
    | (
        | MultiTransformer<Array<UserResolvable>>
        | AsyncMultiTransformer<Array<UserResolvable>>
      )
    | undefined = undefined,
> extends BaseOption<Name, Required, TransformType, MultiTransformType> {
  type = ApplicationCommandOptionType.User as const;

  transform = (async (
    value: UserResolvable,
    context: TransformerContext,
  ): Promise<Result<User, Error>> => {
    if (value instanceof User) {
      return ok(value);
    }

    try {
      const user = await context.user.client.users.fetch(value);
      return ok(user);
    } catch (error) {
      return err(new Error("User not found"));
    }
  }) as TransformType;

  declare useTransformer: <
    NewTransform extends
      | SingleTransformer<UserResolvable>
      | AsyncSingleTransformer<UserResolvable>,
  >(
    transformer: NewTransform,
  ) => UserOption<Name, Required, NewTransform, undefined>;

  declare useMultiTransformer: <
    NewTransform extends
      | MultiTransformer<Array<UserResolvable>>
      | AsyncMultiTransformer<Array<UserResolvable>>,
  >(
    multiTransformer: NewTransform,
  ) => UserOption<Name, Required, undefined, NewTransform>;
}
