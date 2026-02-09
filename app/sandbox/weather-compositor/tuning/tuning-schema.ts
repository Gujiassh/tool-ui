import { z } from "zod";
import { WeatherConditionSchema } from "@/components/tool-ui/weather-widget/schema";

export type ParamId = string;

export const CurveInterpolationSchema = z.enum(["linear", "ease", "step"]);
export type CurveInterpolation = z.infer<typeof CurveInterpolationSchema>;

export const CurveModeSchema = z.enum(["absolute", "delta"]);
export type CurveMode = z.infer<typeof CurveModeSchema>;

export const KnotSchema = z.object({
  t: z.number().min(0).max(1),
  value: z.union([z.number(), z.boolean()]),
});
export type Knot = z.infer<typeof KnotSchema>;

export const CurveSchema = z.object({
  knots: z.array(KnotSchema).min(1),
  interpolation: CurveInterpolationSchema.optional(),
  mode: CurveModeSchema.optional(),
  clamp: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
    })
    .optional(),
});
export type Curve = z.infer<typeof CurveSchema>;

export const CurveMapSchema = z.record(CurveSchema);
export type CurveMap = z.infer<typeof CurveMapSchema>;

export const ConditionProfileSchema = z.object({
  parent: WeatherConditionSchema.optional(),
  curves: CurveMapSchema.optional(),
});
export type ConditionProfile = z.infer<typeof ConditionProfileSchema>;

export const SpecialCaseSchema = z.object({
  when: z.object({
    condition: WeatherConditionSchema.optional(),
    timeRange: z
      .tuple([z.number().min(0).max(1), z.number().min(0).max(1)])
      .optional(),
    flags: z.array(z.string()).optional(),
  }),
  curves: CurveMapSchema,
  priority: z.number().int(),
});
export type SpecialCase = z.infer<typeof SpecialCaseSchema>;

export const WeatherTuningConfigSchema = z.object({
  version: z.literal(1),
  meta: z
    .object({
      name: z.string().optional(),
      updatedAt: z.string().optional(),
    })
    .optional(),
  global: CurveMapSchema.optional(),
  conditions: z.record(ConditionProfileSchema).default({}),
  specialCases: z.array(SpecialCaseSchema).optional(),
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
    global: { $ref: "#/$defs/CurveMap" },
    conditions: {
      type: "object",
      additionalProperties: { $ref: "#/$defs/ConditionProfile" },
    },
    specialCases: {
      type: "array",
      items: { $ref: "#/$defs/SpecialCase" },
    },
  },
  $defs: {
    ConditionProfile: {
      type: "object",
      properties: {
        parent: { type: "string" },
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
        interpolation: {
          type: "string",
          enum: ["linear", "ease", "step"],
          default: "linear",
        },
        mode: {
          type: "string",
          enum: ["absolute", "delta"],
          default: "absolute",
        },
        clamp: {
          type: "object",
          properties: {
            min: { type: "number" },
            max: { type: "number" },
          },
          additionalProperties: false,
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
    SpecialCase: {
      type: "object",
      required: ["when", "curves", "priority"],
      properties: {
        when: {
          type: "object",
          properties: {
            condition: { type: "string" },
            timeRange: {
              type: "array",
              minItems: 2,
              maxItems: 2,
              items: { type: "number", minimum: 0, maximum: 1 },
            },
            flags: { type: "array", items: { type: "string" } },
          },
          additionalProperties: false,
        },
        curves: { $ref: "#/$defs/CurveMap" },
        priority: { type: "integer" },
      },
      additionalProperties: false,
    },
  },
} as const;
