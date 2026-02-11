import { z } from "zod";
import {
  ToolUIIdSchema,
  ToolUIReceiptSchema,
  ToolUIRoleSchema,
  SerializableActionSchema,
  SerializableActionsConfigSchema,
  defineToolUiContract,
} from "../shared";

export const TerminalPropsSchema = z.object({
  id: ToolUIIdSchema,
  role: ToolUIRoleSchema.optional(),
  receipt: ToolUIReceiptSchema.optional(),
  command: z.string(),
  stdout: z.string().optional(),
  stderr: z.string().optional(),
  exitCode: z.number(),
  durationMs: z.number().optional(),
  cwd: z.string().optional(),
  truncated: z.boolean().optional(),
  maxCollapsedLines: z.number().min(1).optional(),
  responseActions: z
    .union([z.array(SerializableActionSchema), SerializableActionsConfigSchema])
    .optional(),
  className: z.string().optional(),
});

export type TerminalProps = z.infer<typeof TerminalPropsSchema> & {
  onResponseAction?: (actionId: string) => void | Promise<void>;
  onBeforeResponseAction?: (actionId: string) => boolean | Promise<boolean>;
};

export const SerializableTerminalSchema = TerminalPropsSchema.omit({
  className: true,
});

export type SerializableTerminal = z.infer<typeof SerializableTerminalSchema>;

const SerializableTerminalSchemaContract = defineToolUiContract(
  "Terminal",
  SerializableTerminalSchema,
);

export const parseSerializableTerminal: (
  input: unknown,
) => SerializableTerminal = SerializableTerminalSchemaContract.parse;

export const safeParseSerializableTerminal: (
  input: unknown,
) => SerializableTerminal | null = SerializableTerminalSchemaContract.safeParse;
