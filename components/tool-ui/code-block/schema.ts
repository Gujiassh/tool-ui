import { z } from "zod";
import { defineToolUiContract } from "../shared/contract";
import {
  ToolUIIdSchema,
  ToolUIReceiptSchema,
  ToolUIRoleSchema,
} from "../shared/schema";

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
  className: z.string().optional(),
});

export type CodeBlockProps = z.infer<typeof CodeBlockPropsSchema>;

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
