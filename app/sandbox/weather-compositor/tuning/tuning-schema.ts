import { z } from "zod";
export type ParamId = string;

export const KnotSchema = z.object({
  t: z.number().min(0).max(1),
  value: z.union([z.number(), z.boolean()]),
});
export type Knot = z.infer<typeof KnotSchema>;

export const CurveSchema = z.object({
  knots: z.array(KnotSchema).min(1),
});
export type Curve = z.infer<typeof CurveSchema>;

export const CurveMapSchema = z.record(CurveSchema);
export type CurveMap = z.infer<typeof CurveMapSchema>;

export const ConditionProfileSchema = z.object({
  curves: CurveMapSchema.optional(),
});
export type ConditionProfile = z.infer<typeof ConditionProfileSchema>;

export const WeatherTuningConfigSchema = z.object({
  version: z.literal(1),
  meta: z
    .object({
      name: z.string().optional(),
      updatedAt: z.string().optional(),
    })
    .optional(),
  conditions: z.record(ConditionProfileSchema).default({}),
});
export type WeatherTuningConfig = z.infer<typeof WeatherTuningConfigSchema>;

export const WEATHER_TUNING_CONFIG_JSON_SCHEMA = {
  $id: "WeatherTuningConfig",
  type: "object",
  required: ["version", "conditions"],
  properties: {
    version: { type: "integer", const: 1 },
    meta: {
      type: "object",
      properties: {
        name: { type: "string" },
        updatedAt: { type: "string", format: "date-time" },
      },
      additionalProperties: false,
    },
    conditions: {
      type: "object",
      additionalProperties: { $ref: "#/$defs/ConditionProfile" },
    },
  },
  $defs: {
    ConditionProfile: {
      type: "object",
      properties: {
        curves: { $ref: "#/$defs/CurveMap" },
      },
      additionalProperties: false,
    },
    CurveMap: {
      type: "object",
      additionalProperties: { $ref: "#/$defs/Curve" },
    },
    Curve: {
      type: "object",
      required: ["knots"],
      properties: {
        knots: {
          type: "array",
          minItems: 1,
          items: { $ref: "#/$defs/Knot" },
        },
      },
      additionalProperties: false,
    },
    Knot: {
      type: "object",
      required: ["t", "value"],
      properties: {
        t: { type: "number", minimum: 0, maximum: 1 },
        value: { type: ["number", "boolean"] },
      },
      additionalProperties: false,
    },
  },
} as const;
