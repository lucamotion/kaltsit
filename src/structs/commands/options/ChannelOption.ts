import {
  ApplicationCommandOptionType,
  BaseChannel,
  Channel,
  ChannelResolvable,
} from "discord.js";
import { err, ok, Result } from "neverthrow";
import {
  AsyncMultiTransformer,
  AsyncSingleTransformer,
  type MultiTransformer,
  type SingleTransformer,
} from "../../../types/types.js";
import { TransformerContext } from "../TransformerContext.js";
import { BaseOption } from "./BaseOption.js";

export class ChannelOption<
  Name extends string,
  Required extends boolean = false,
  Internal extends boolean = false,
  TransformType extends
    | (
        | SingleTransformer<ChannelResolvable>
        | AsyncSingleTransformer<ChannelResolvable>
      )
    | undefined = AsyncSingleTransformer<
    ChannelResolvable,
    Result<Channel, Error>
  >,
  MultiTransformType extends
    | (
        | MultiTransformer<Array<ChannelResolvable>>
        | AsyncMultiTransformer<Array<ChannelResolvable>>
      )
    | undefined = undefined,
> extends BaseOption<
  Name,
  Required,
  Internal,
  TransformType,
  MultiTransformType
> {
  type = ApplicationCommandOptionType.Channel as const;

  transform = (async (
    value: ChannelResolvable,
    context: TransformerContext,
  ): Promise<Result<Channel, Error>> => {
    if (value instanceof BaseChannel) {
      return ok(value);
    }

    const channel = await context.user.client.channels.fetch(value.toString());

    if (!channel) {
      return err(new Error("Channel not found"));
    }

    return ok(channel);
  }) as TransformType;

  declare useTransformer: <
    NewTransform extends
      | SingleTransformer<ChannelResolvable>
      | AsyncSingleTransformer<ChannelResolvable>,
  >(
    transformer: NewTransform,
  ) => ChannelOption<Name, Required, Internal, NewTransform, undefined>;

  declare useMultiTransformer: <
    NewTransform extends
      | MultiTransformer<Array<ChannelResolvable>>
      | AsyncMultiTransformer<Array<ChannelResolvable>>,
  >(
    multiTransformer: NewTransform,
  ) => ChannelOption<Name, Required, Internal, undefined, NewTransform>;
}
