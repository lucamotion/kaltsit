import { ApplicationCommandOptionType, Attachment } from "discord.js";
import { ok, Result } from "neverthrow";
import {
  AsyncMultiTransformer,
  AsyncSingleTransformer,
  type MultiTransformer,
  type SingleTransformer,
} from "../../../types/types.js";
import { TransformerContext } from "../TransformerContext.js";
import { CommandOption } from "./CommandOption.js";

export class AttachmentOption<
  Name extends string,
  Required extends boolean = false,
  TransformType extends
    | (SingleTransformer<Attachment> | AsyncSingleTransformer<Attachment>)
    | undefined = AsyncSingleTransformer<Attachment, Result<Attachment, Error>>,
  MultiTransformType extends
    | (
        | MultiTransformer<Array<Attachment>>
        | AsyncMultiTransformer<Array<Attachment>>
      )
    | undefined = undefined,
> extends CommandOption<Name, Required, TransformType, MultiTransformType> {
  type = ApplicationCommandOptionType.Attachment as const;

  transform = (async (
    value: Attachment,
    context: TransformerContext,
  ): Promise<Result<Attachment, Error>> => {
    return ok(value);
  }) as TransformType;

  declare useTransformer: <
    NewTransform extends
      | SingleTransformer<Attachment>
      | AsyncSingleTransformer<Attachment>,
  >(
    transformer: NewTransform,
  ) => AttachmentOption<Name, Required, NewTransform, undefined>;

  declare useMultiTransformer: <
    NewTransform extends
      | MultiTransformer<Array<Attachment>>
      | AsyncMultiTransformer<Array<Attachment>>,
  >(
    multiTransformer: NewTransform,
  ) => AttachmentOption<Name, Required, undefined, NewTransform>;
}
