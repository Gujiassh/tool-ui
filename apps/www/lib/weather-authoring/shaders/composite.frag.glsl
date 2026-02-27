#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform sampler2D u_sceneTexture;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_timeOfDay;
uniform vec2 u_sunPos;
uniform float u_sunVisible;
uniform float u_lastFlashTime;
uniform float u_strikeSeed;
uniform float u_lightningSceneIllumination;

uniform bool u_postEnabled;

// Aerial perspective / haze
uniform float u_haze;
uniform float u_hazeHorizon;
uniform float u_hazeDesaturation;
uniform float u_hazeContrast;

// Bloom / glare
uniform float u_bloomIntensity;
uniform float u_bloomThreshold;
uniform float u_bloomKnee;
uniform float u_bloomRadius;
uniform float u_bloomTapScale;

// Exposure response (lightning)
uniform float u_exposureIntensity;
uniform float u_exposureDesaturation;
uniform float u_exposureRecovery;

// Crepuscular rays
uniform float u_godRayIntensity;
uniform float u_godRayDecay;
uniform float u_godRayDensity;
uniform float u_godRayWeight;
uniform int u_godRaySamples;

#define PI 3.14159265359
#define GODRAY_MAX_SAMPLES 32

float saturate(float x) {
  return clamp(x, 0.0, 1.0);
}

float luminance(vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

// -----------------------------------------------------------------------------
// Lightning flash envelope (mirrors lightning pass timing)
// -----------------------------------------------------------------------------
float easeOutSine(float t) { return sin(t * PI * 0.5); }
float easeInSine(float t) { return 1.0 - cos(t * PI * 0.5); }
float easeInOutSine(float t) { return -(cos(PI * t) - 1.0) * 0.5; }
float easeOutQuad(float t) { return 1.0 - (1.0 - t) * (1.0 - t); }
float easeOutCubic(float t) { float inv = 1.0 - t; return 1.0 - inv * inv * inv; }

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float flashEnvelope(float timeSinceStrike, float duration) {
  if (timeSinceStrike < 0.0 || timeSinceStrike > duration) return 0.0;
  float t = timeSinceStrike / duration;
  float attackT = clamp(t / 0.03, 0.0, 1.0);
  float attack = easeOutCubic(attackT);
  float sustainT = clamp((t - 0.05) / 0.65, 0.0, 1.0);
  float sustain = 1.0 - easeInOutSine(sustainT);
  float decay = exp(-t * 2.0);
  decay = mix(decay, easeOutSine(1.0 - t), 0.3);
  float endT = clamp((t - 0.75) / 0.25, 0.0, 1.0);
  float endFade = 1.0 - easeInSine(endT);
  return attack * max(sustain, decay * 0.4) * endFade;
}

float restrikeEnvelope(float timeSinceStrike, float duration, float seed) {
  float env = flashEnvelope(timeSinceStrike, duration * 0.7);
  if (hash11(seed * 7.7) > 0.7) {
    float restrike1 = flashEnvelope(timeSinceStrike - duration * 0.5, duration * 0.3);
    env = max(env, restrike1 * 0.6);
  }
  if (hash11(seed * 11.3) > 0.85) {
    float restrike2 = flashEnvelope(timeSinceStrike - duration * 0.75, duration * 0.2);
    env = max(env, restrike2 * 0.4);
  }
  return env;
}

// -----------------------------------------------------------------------------
// Post-process building blocks
// -----------------------------------------------------------------------------
float getSunAltitudeFromTimeOfDay(float timeOfDay) {
  // 0..1 timeOfDay -> -1..1 altitude (mirrors cloud/celestial assumptions)
  float sunAlt = timeOfDay < 0.5 ? timeOfDay * 2.0 : 2.0 - timeOfDay * 2.0;
  return sunAlt * 2.0 - 1.0;
}

vec3 applyHaze(vec3 color, vec2 uv) {
  float haze = saturate(u_haze);
  if (haze <= 0.0001) return color;

  float horizon = pow(1.0 - uv.y, 1.8);
  float hazeWeight = haze * mix(1.0, horizon, saturate(u_hazeHorizon));

  // Slight horizon lift (mix towards a sky-tinted haze color).
  float sunAlt = getSunAltitudeFromTimeOfDay(u_timeOfDay);
  float daylight = smoothstep(-0.12, 0.1, sunAlt);
  vec3 hazeDay = vec3(0.60, 0.70, 0.85);
  vec3 hazeNight = vec3(0.06, 0.07, 0.10);
  vec3 hazeColor = mix(hazeNight, hazeDay, daylight);
  color = mix(color, hazeColor, hazeWeight * 0.55);

  // Contrast compression (towards mid gray).
  float contrast = saturate(1.0 - hazeWeight * saturate(u_hazeContrast));
  color = mix(vec3(0.5), color, contrast);

  // Slight desaturation.
  float gray = luminance(color);
  float sat = saturate(1.0 - hazeWeight * saturate(u_hazeDesaturation));
  color = mix(vec3(gray), color, sat);

  return color;
}

vec3 bloomTap(vec2 uv) {
  vec3 c = texture(u_sceneTexture, clamp(uv, 0.0, 1.0)).rgb;
  float l = luminance(c);
  float knee = max(0.0001, u_bloomKnee);
  float m = smoothstep(u_bloomThreshold, u_bloomThreshold + knee, l);
  return c * m;
}

vec3 computeBloom(vec2 uv) {
  float intensity = u_bloomIntensity;
  if (intensity <= 0.0001) return vec3(0.0);

  vec2 texel = 1.0 / max(u_resolution, vec2(1.0));
  // Interpret bloomRadius as a scene-relative scalar, not literal pixels.
  // This keeps the control meaningful across widget sizes and DPR.
  float radiusPx = max(0.0, u_bloomRadius) * (u_resolution.y * 0.02);
  radiusPx *= max(0.25, u_bloomTapScale);
  vec2 d = texel * radiusPx;

  // 9-tap blur (center + 4 cardinal + 4 diagonal). Weights sum to 1.
  vec3 sum = vec3(0.0);
  sum += bloomTap(uv) * 0.20;
  sum += bloomTap(uv + vec2( d.x, 0.0)) * 0.12;
  sum += bloomTap(uv + vec2(-d.x, 0.0)) * 0.12;
  sum += bloomTap(uv + vec2(0.0,  d.y)) * 0.12;
  sum += bloomTap(uv + vec2(0.0, -d.y)) * 0.12;
  sum += bloomTap(uv + vec2( d.x,  d.y)) * 0.08;
  sum += bloomTap(uv + vec2(-d.x,  d.y)) * 0.08;
  sum += bloomTap(uv + vec2( d.x, -d.y)) * 0.08;
  sum += bloomTap(uv + vec2(-d.x, -d.y)) * 0.08;

  return sum * intensity;
}

vec3 applyExposureResponse(vec3 color, float flashStrength) {
  if (flashStrength <= 0.0001) return color;

  // Treat flashStrength as already “intensity-scaled” (so the UI sliders are
  // predictable). Use a smooth, LDR-friendly curve that still brightens values
  // below 1.0 (Reinhard can cancel out gains for sub-1 values).
  float t = saturate(flashStrength);
  float gain = 1.0 + flashStrength * 2.2;
  vec3 lifted = color * gain;
  vec3 tonemapped = 1.0 - exp(-lifted);

  vec3 outColor = mix(color, tonemapped, t);

  // Subtle desaturation at peak flash.
  float gray = luminance(outColor);
  float desat = saturate(u_exposureDesaturation) * t;
  outColor = mix(outColor, vec3(gray), desat);

  // A tiny “white crush” at peak helps it read as sensor saturation.
  outColor = mix(outColor, vec3(1.0), t * 0.06);

  return outColor;
}

vec3 computeGodRays(vec2 uv) {
  if (u_godRayIntensity <= 0.0001) return vec3(0.0);
  if (u_godRaySamples <= 0) return vec3(0.0);
  if (u_sunVisible <= 0.001) return vec3(0.0);

  float sunAlt = getSunAltitudeFromTimeOfDay(u_timeOfDay);
  float daylight = smoothstep(-0.12, 0.1, sunAlt);
  // Crepuscular rays are most believable when the sun is low. This gating also
  // prevents noon blowout even if the user cranks u_godRayIntensity.
  float lowSun = 1.0 - smoothstep(0.25, 0.75, max(0.0, sunAlt));

  // Clamp sun position to sampling domain; if it's far off-screen, rays look odd.
  vec2 sunUV = clamp(u_sunPos, vec2(-0.25), vec2(1.25));
  vec2 delta = (uv - sunUV) * (u_godRayDensity / float(u_godRaySamples));

  vec2 coord = uv;
  float illuminationDecay = 1.0;
  float accum = 0.0;

  // Hard cap for WebGL loop constraints.
  for (int i = 0; i < GODRAY_MAX_SAMPLES; i++) {
    if (i >= u_godRaySamples) break;
    coord -= delta;
    vec4 s = texture(u_sceneTexture, clamp(coord, 0.0, 1.0));

    // Alpha encodes cloud opacity (0 = clear, 1 = fully occluded).
    float transmittance = 1.0 - saturate(s.a);
    float sampleLum = luminance(s.rgb);

    // Require some brightness along the path so rays read like “sunlight leaking”.
    // Use a high threshold so we don’t integrate the entire bright sky, which
    // can quickly wash the scene to white at midday.
    float brightMask = saturate((sampleLum - 0.85) / 0.15);
    brightMask *= brightMask;
    float raySample = transmittance * brightMask;

    accum += raySample * illuminationDecay * u_godRayWeight;
    illuminationDecay *= u_godRayDecay;
  }

  // Color: warm daylight shafts.
  vec3 rayColor = mix(vec3(0.7, 0.72, 0.8), vec3(1.0, 0.92, 0.75), daylight);

  float intensity = u_godRayIntensity * saturate(u_sunVisible) * daylight * lowSun;
  return rayColor * accum * intensity;
}

void main() {
  vec4 scene = texture(u_sceneTexture, v_uv);
  vec3 color = scene.rgb;

  if (!u_postEnabled) {
    fragColor = vec4(color, 1.0);
    return;
  }

  // Rays first so they can be bloomed/overexposed later.
  color += computeGodRays(v_uv);

  // Bloom/glare (forward scatter).
  color += computeBloom(v_uv);

  // Lightning-driven exposure response (global camera feel).
  float flashStrength = 0.0;
  if (u_exposureIntensity > 0.0001) {
    float timeSinceStrike = u_time - u_lastFlashTime;
    float durationSec = 0.8;

    float f = restrikeEnvelope(timeSinceStrike, durationSec, u_strikeSeed);
    float afterimageDuration = durationSec * 1.5;
    // Guard against 0 recovery which would “stick” the afterimage.
    float afterT = clamp((timeSinceStrike * max(0.05, u_exposureRecovery)) / afterimageDuration, 0.0, 1.0);
    float afterimage = timeSinceStrike < 0.0 ? 0.0 : (1.0 - easeInSine(afterT));

    // Legacy “scene illumination” (kept separate from exposure so tuning the
    // camera response doesn’t get unintentionally suppressed).
    float sceneFlash = f * max(0.0, u_lightningSceneIllumination);
    color += vec3(0.3, 0.32, 0.4) * sceneFlash;

    // Exposure response: controlled directly by u_exposureIntensity.
    // Keep the tail subtle; flash does the heavy lifting.
    flashStrength = f * u_exposureIntensity;
    flashStrength = max(flashStrength, afterimage * u_exposureIntensity * 0.12);
    color = applyExposureResponse(color, flashStrength);
  }

  // Aerial perspective / haze as the final “air” grade.
  color = applyHaze(color, v_uv);

  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}

