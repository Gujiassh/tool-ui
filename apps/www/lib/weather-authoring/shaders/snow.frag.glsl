#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_sceneTexture;
uniform float u_intensity;
uniform int u_layers;
uniform float u_fallSpeed;
uniform float u_windSpeed;
uniform float u_windAngle;
uniform float u_turbulence;
uniform float u_drift;
uniform float u_flutter;
uniform float u_windShear;
uniform float u_flakeSize;
uniform float u_sizeVariation;
uniform float u_opacity;
uniform float u_glowAmount;
uniform float u_sparkle;

#define PI 3.14159265359
#define MAX_LAYERS 6

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

vec2 rotate2D(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

float snowflakeShape(vec2 uv, float size, float seed, float rotation) {
  vec2 rotatedUV = rotate2D(uv, rotation);
  float dist = length(rotatedUV);
  float circle = smoothstep(size, size * 0.3, dist);
  float angle = atan(rotatedUV.y, rotatedUV.x);
  float hexPattern = 0.5 + 0.5 * cos(angle * 6.0);
  hexPattern = pow(hexPattern, 2.0);
  float crystalAmount = smoothstep(0.02, 0.05, size) * 0.3;
  float shape = mix(circle, circle * (0.7 + hexPattern * 0.3), crystalAmount);
  float glow = exp(-dist * dist / (size * size * 3.0)) * u_glowAmount;
  return shape + glow * 0.4;
}

vec2 getWind(float layerDepth) {
  // Important: keep wind independent of uv to avoid warping the entire field.
  // Per-flake turbulence/drift is applied later (to flakePos) so the result
  // reads like particles, not like a screen-space displacement/refraction map.
  vec2 baseWind = vec2(cos(u_windAngle), 0.0) * u_windSpeed;
  float windResponse = mix(0.3, 1.0, 1.0 - layerDepth);

  // Model "wind shear" as stronger motion in foreground layers rather than a
  // screen-space gradient (which can make the whole effect look bent).
  float shearResponse = 1.0 + u_windShear * (1.0 - layerDepth) * 0.35;

  return baseWind * windResponse * shearResponse;
}

float sparkle(vec2 cellId, float time, float seed) {
  float sparklePhase = hash12(cellId + vec2(seed * 100.0, 0.0)) * 100.0;
  float sparkleFreq = 2.0 + hash12(cellId + vec2(0.0, seed * 100.0)) * 3.0;
  float sparkleWave = sin(time * sparkleFreq + sparklePhase);
  float sparkleIntensity = pow(max(0.0, sparkleWave), 16.0);
  float sparkleProbability = hash12(cellId + vec2(floor(time * 0.5), 0.0));
  sparkleIntensity *= step(0.85, sparkleProbability);
  return sparkleIntensity * u_sparkle;
}

vec3 snowLayer(vec2 uv, float time, float layerIndex, float totalLayers) {
  float depth = layerIndex / max(1.0, totalLayers - 1.0);
  float layerScale = mix(8.0, 40.0, depth);
  float layerSpeed = u_fallSpeed * mix(1.2, 0.4, depth);
  float layerDensity = u_intensity * mix(1.0, 0.5, depth);
  float layerFlakeSize = u_flakeSize * mix(1.5, 0.3, depth);
  float layerOpacity = u_opacity * mix(1.0, 0.4, depth);

  vec2 layerOffset = vec2(
    sin(layerIndex * 73.156) * 10.0,
    cos(layerIndex * 37.842) * 10.0
  );

  vec2 p = (uv + layerOffset) * layerScale;
  p.y += time * layerSpeed * 2.0;

  vec2 baseWind = getWind(depth);
  p.x += time * baseWind.x * 0.3;

  vec2 id = floor(p);
  vec2 gv = fract(p) - 0.5;

  float snow = 0.0;
  float sparkleAccum = 0.0;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offs = vec2(float(x), float(y));
      vec2 cellId = id + offs;

      float h1 = hash12(cellId);
      vec2 h2 = hash22(cellId);
      float h3 = hash12(cellId + vec2(127.0, 311.0));
      float h4 = hash12(cellId + vec2(271.0, 183.0));

      if (h1 > layerDensity) continue;

      float sizeVar = 1.0 + (h3 - 0.5) * u_sizeVariation;
      float size = layerFlakeSize * sizeVar * 0.04;

      vec2 flakePos = h2 * 0.8 - 0.4;

      float flutterPhase = h3 * PI * 2.0;
      float flutterAmp = u_flutter * 0.15 * (1.0 - depth);
      flakePos.x += sin(time * 3.0 + flutterPhase) * flutterAmp;
      flakePos.y += cos(time * 2.5 + flutterPhase * 1.3) * flutterAmp * 0.5;

      // Per-flake drift (bounded) — avoid bending the whole field by not applying
      // sinusoidal offsets to p (the grid coordinate system).
      float driftPhase = h4 * PI * 2.0 + layerIndex * 1.7;
      flakePos.x += sin(time * 0.55 + driftPhase) * u_drift * 0.18;

      // Per-flake turbulence (bounded) — adds gusty motion without warping UVs.
      float turbFreq = 0.6 + u_turbulence * 1.4;
      vec2 turb = vec2(
        noise(cellId * 0.17 + time * turbFreq),
        noise(cellId.yx * 0.17 + time * turbFreq + 17.0)
      ) - 0.5;
      flakePos += turb * (u_turbulence * 0.22) * (1.0 - depth);

      vec2 localUV = gv - offs - flakePos;

      float rotationSpeed = (1.5 - sizeVar * 0.5) * (0.5 + h4 * 1.0);
      float rotationPhase = h4 * PI * 2.0;
      float rotation = time * rotationSpeed + rotationPhase;

      float flake = snowflakeShape(localUV, size, h1, rotation);
      float flakeSparkle = sparkle(cellId, time, h1) * flake;
      sparkleAccum += flakeSparkle;

      snow += flake * layerOpacity;
    }
  }

  return vec3(snow, sparkleAccum, depth);
}

void main() {
  vec4 scene = texture(u_sceneTexture, v_uv);
  vec2 uv = v_uv;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float snow = 0.0;
  float totalSparkle = 0.0;

  for (int i = u_layers - 1; i >= 0; i--) {
    vec3 layerResult = snowLayer(uv, u_time, float(i), float(u_layers));
    snow += layerResult.x;
    totalSparkle += layerResult.y;
  }

  snow = clamp(snow, 0.0, 1.0);
  totalSparkle = clamp(totalSparkle, 0.0, 1.0);

  vec3 snowColor = vec3(0.75, 0.78, 0.85);
  vec3 sparkleColor = vec3(0.9, 0.92, 1.0);

  vec3 color = scene.rgb + snowColor * snow + sparkleColor * totalSparkle;

  fragColor = vec4(color, scene.a);
}

