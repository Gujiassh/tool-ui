import { z } from "zod";
import { defineToolUiContract } from "../shared/contract";
import {
  ToolUIIdSchema,
  ToolUIReceiptSchema,
  ToolUIRoleSchema,
} from "../shared/schema";

export const CodeDiffPropsSchema = z.object({
  id: ToolUIIdSchema,
  role: ToolUIRoleSchema.optional(),
  receipt: ToolUIReceiptSchema.optional(),
  oldCode: z.string().optional(),
  newCode: z.string().optional(),
  patch: z.string().optional(),
  language: z.string().trim().min(1).default("text"),
  filename: z.string().optional(),
  lineNumbers: z.enum(["visible", "hidden"]).default("visible"),
  diffStyle: z.enum(["unified", "split"]).default("unified"),
  maxCollapsedLines: z.number().min(1).optional(),
  className: z.string().optional(),
});

export type CodeDiffProps = z.infer<typeof CodeDiffPropsSchema>;

export const SerializableCodeDiffSchema = CodeDiffPropsSchema.omit({
  className: true,
});

export type SerializableCodeDiff = z.infer<typeof SerializableCodeDiffSchema>;

const SerializableCodeDiffSchemaContract = defineToolUiContract(
  "CodeDiff",
  SerializableCodeDiffSchema,
);

export const parseSerializableCodeDiff: (
  input: unknown,
) => SerializableCodeDiff = SerializableCodeDiffSchemaContract.parse;

export const safeParseSerializableCodeDiff: (
  input: unknown,
) => SerializableCodeDiff | null =
  SerializableCodeDiffSchemaContract.safeParse;
