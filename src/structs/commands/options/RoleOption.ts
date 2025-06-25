import { ApplicationCommandOptionType, Role, RoleResolvable } from "discord.js";
import { err, ok, Result } from "neverthrow";
import {
  AsyncMultiTransformer,
  AsyncSingleTransformer,
  type MultiTransformer,
  type SingleTransformer,
} from "../../../types/types.js";
import { TransformerContext } from "../TransformerContext.js";
import { BaseOption } from "./BaseOption.js";

export class RoleOption<
  Name extends string,
  Required extends boolean = false,
  TransformType extends
    | (
        | SingleTransformer<RoleResolvable>
        | AsyncSingleTransformer<RoleResolvable>
      )
    | undefined = AsyncSingleTransformer<RoleResolvable, Result<Role, Error>>,
  MultiTransformType extends
    | (
        | MultiTransformer<Array<RoleResolvable>>
        | AsyncMultiTransformer<Array<RoleResolvable>>
      )
    | undefined = undefined,
> extends BaseOption<Name, Required, TransformType, MultiTransformType> {
  type = ApplicationCommandOptionType.Role as const;

  transform = (async (
    value: RoleResolvable,
    context: TransformerContext,
  ): Promise<Result<Role, Error>> => {
    if (value instanceof Role) {
      return ok(value);
    }

    if (!context.guild) {
      return err(new Error("cannot fetch role outside of a guild"));
    }

    const role = await context.guild.roles.fetch(value);

    if (!role) {
      return err(new Error("Role not found"));
    }

    return ok(role);
  }) as TransformType;

  declare useTransformer: <
    NewTransform extends
      | SingleTransformer<RoleResolvable>
      | AsyncSingleTransformer<RoleResolvable>,
  >(
    transformer: NewTransform,
  ) => RoleOption<Name, Required, NewTransform, undefined>;

  declare useMultiTransformer: <
    NewTransform extends
      | MultiTransformer<Array<RoleResolvable>>
      | AsyncMultiTransformer<Array<RoleResolvable>>,
  >(
    multiTransformer: NewTransform,
  ) => RoleOption<Name, Required, undefined, NewTransform>;
}
