import { z } from "zod";
import {
  ToolUIIdSchema,
  ToolUIReceiptSchema,
  ToolUIRoleSchema,
  SerializableActionSchema,
  SerializableActionsConfigSchema,
  defineToolUiContract,
} from "../shared";

export const CodeBlockPropsSchema = z.object({
  id: ToolUIIdSchema,
  role: ToolUIRoleSchema.optional(),
  receipt: ToolUIReceiptSchema.optional(),
  code: z.string(),
  language: z.string().default("text"),
  filename: z.string().optional(),
  showLineNumbers: z.boolean().default(true),
  highlightLines: z.array(z.number()).optional(),
  maxCollapsedLines: z.number().min(1).optional(),
  responseActions: z
    .union([z.array(SerializableActionSchema), SerializableActionsConfigSchema])
    .optional(),
  className: z.string().optional(),
});

export type CodeBlockProps = z.infer<typeof CodeBlockPropsSchema> & {
  onResponseAction?: (actionId: string) => void | Promise<void>;
  onBeforeResponseAction?: (actionId: string) => boolean | Promise<boolean>;
};

export const SerializableCodeBlockSchema = CodeBlockPropsSchema.omit({
  className: true,
});

export type SerializableCodeBlock = z.infer<typeof SerializableCodeBlockSchema>;

const SerializableCodeBlockSchemaContract = defineToolUiContract(
  "CodeBlock",
  SerializableCodeBlockSchema,
);

export const parseSerializableCodeBlock: (
  input: unknown,
) => SerializableCodeBlock = SerializableCodeBlockSchemaContract.parse;

export const safeParseSerializableCodeBlock: (
  input: unknown,
) => SerializableCodeBlock | null =
  SerializableCodeBlockSchemaContract.safeParse;
