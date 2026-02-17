#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_sceneTexture;
uniform float u_timeOfDay;
uniform float u_coverage;
uniform float u_density;
uniform float u_softness;
uniform float u_windSpeed;
uniform float u_windAngle;
uniform float u_turbulence;
uniform float u_lightIntensity;
uniform float u_ambientDarkness;
uniform int u_numLayers;
uniform float u_cloudScale;
uniform vec2 u_celestialPos;
uniform float u_celestialSize;
uniform float u_celestialBrightness;
uniform float u_backlightIntensity;

#define PI 3.14159265359

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

float cloudLayer(vec2 uv, float time, float layerSeed, float speed, float turbAmount) {
  vec2 wind = vec2(cos(u_windAngle), sin(u_windAngle)) * speed * time;

  // Each layer gets unique offset, scale, and rotation based on seed
  float layerScale = (1.8 + hash(vec2(layerSeed, 0.0)) * 1.2) * u_cloudScale;
  float layerRotation = hash(vec2(layerSeed, 1.0)) * 0.5 - 0.25;
  vec2 layerOffset = vec2(
    hash(vec2(layerSeed, 2.0)) * 100.0,
    hash(vec2(layerSeed, 3.0)) * 100.0
  );

  // Apply rotation
  float c = cos(layerRotation);
  float s = sin(layerRotation);
  vec2 rotatedUV = vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c);

  vec2 p = rotatedUV * layerScale + wind + layerOffset;

  // Turbulence with layer-specific offset
  float turbSeed = layerSeed * 50.0;
  vec2 turbOffset = vec2(
    fbm(p * 0.5 + time * 0.1 + turbSeed, 4),
    fbm(p * 0.5 + turbSeed + 100.0 + time * 0.1, 4)
  ) * turbAmount;

  float n = fbm(p + turbOffset, 6);
  return n;
}

vec3 cloudLighting(float density, float heightInCloud, float sunAlt, float warmth, float nightFactor, vec2 uv) {
  float daylight = smoothstep(-0.12, 0.1, sunAlt);

  vec3 dayLitColor = vec3(1.0, 0.98, 0.96);
  vec3 sunsetLitColor = vec3(1.0, 0.7, 0.45);
  vec3 nightLitColor = vec3(0.12, 0.14, 0.2);
  vec3 litColor = mix(dayLitColor, sunsetLitColor, warmth);
  litColor = mix(litColor, nightLitColor, nightFactor);

  vec3 dayShadowColor = vec3(0.45, 0.5, 0.6);
  vec3 sunsetShadowColor = vec3(0.35, 0.25, 0.3);
  vec3 nightShadowColor = vec3(0.03, 0.04, 0.07);
  vec3 shadowColor = mix(dayShadowColor, sunsetShadowColor, warmth);
  shadowColor = mix(shadowColor, nightShadowColor, nightFactor);
  shadowColor *= (1.0 - u_ambientDarkness * 0.3);

  float topLight = heightInCloud * max(0.0, sunAlt);
  float sideLight = (1.0 - abs(heightInCloud - 0.5) * 2.0) * (1.0 - sunAlt * 0.5);
  float bottomLight = (1.0 - heightInCloud) * warmth * 0.5;
  float ambientLight = mix(0.03, 0.2, daylight);

  float lightAmount = (topLight * 0.5 + sideLight * 0.3 + bottomLight) * daylight + ambientLight;
  lightAmount = clamp(lightAmount * u_lightIntensity, 0.0, 1.0);

  vec3 cloudColor = mix(shadowColor, litColor, lightAmount);

  float rimLight = pow(density, 0.5) * (1.0 - density) * 4.0;
  vec3 rimColor = mix(vec3(1.0, 1.0, 0.95), vec3(1.0, 0.8, 0.5), warmth);
  rimColor = mix(rimColor, vec3(0.15, 0.18, 0.25), nightFactor);
  float rimStrength = mix(0.1, 0.3, daylight);
  cloudColor += rimColor * rimLight * rimStrength * u_lightIntensity;

  float hotSpot = pow(max(0.0, lightAmount - 0.6) * 2.5, 2.0) * warmth * daylight;
  cloudColor += vec3(1.0, 0.5, 0.2) * hotSpot * 0.4;

  // Celestial body illumination - clouds near sun/moon get backlit
  float aspect = u_resolution.x / u_resolution.y;
  vec2 celestialUV = u_celestialPos;
  vec2 diff = (uv - celestialUV) * vec2(aspect, 1.0);
  float distToCelestial = length(diff);

  // Light transmission - thin clouds scatter light, thick clouds block it
  float transmission = pow(1.0 - density, 2.0); // quadratic falloff - dense clouds block more

  // Backlight glow - extends beyond the celestial body, but blocked by dense clouds
  float glowRadius = u_celestialSize * 6.0;
  float proximityGlow = exp(-distToCelestial * distToCelestial / (glowRadius * glowRadius));
  float backlight = proximityGlow * transmission * u_celestialBrightness;

  // Silver lining - bright edges where thin cloud meets thick cloud near celestial
  // Peaks at medium density (the transition zone), requires proximity to celestial
  float edgeDist = u_celestialSize * 3.0;
  float nearCelestial = smoothstep(edgeDist * 2.5, edgeDist * 0.3, distToCelestial);
  float edgeFactor = density * (1.0 - density) * 4.0; // peaks at 0.5 density
  float silverLining = nearCelestial * edgeFactor * u_celestialBrightness;

  // Color based on day/night, scaled by backlight intensity control
  vec3 backlightColor = mix(vec3(1.0, 0.9, 0.7), vec3(0.7, 0.75, 0.9), nightFactor);
  cloudColor += backlightColor * (backlight * 0.5 + silverLining * 0.8) * u_backlightIntensity;

  return cloudColor;
}

void main() {
  vec2 uv = v_uv;
  vec4 scene = texture(u_sceneTexture, uv);

  float sunAlt = u_timeOfDay < 0.5 ? u_timeOfDay * 2.0 : 2.0 - u_timeOfDay * 2.0;
  sunAlt = sunAlt * 2.0 - 1.0;

  float warmth = 1.0 - smoothstep(0.0, 0.4, sunAlt);
  warmth = warmth * warmth;
  float nightFactor = 1.0 - smoothstep(-0.12, 0.02, sunAlt);
  float daylight = smoothstep(-0.12, 0.1, sunAlt);

  vec3 color = scene.rgb;
  float accumulatedAlpha = 0.0;

  for (int i = u_numLayers - 1; i >= 0; i--) {
    float layerIdx = float(i);
    float layerDepth = layerIdx / max(1.0, float(u_numLayers) - 1.0);

    float layerSeed = layerIdx * 7.31 + 13.0;
    float layerSpeed = u_windSpeed * (0.6 + hash(vec2(layerSeed, 10.0)) * 0.8);
    float layerTurb = u_turbulence * (0.7 + hash(vec2(layerSeed, 11.0)) * 0.6);

    float cloud = cloudLayer(uv, u_time, layerSeed, layerSpeed, layerTurb);

    float threshold = 1.0 - u_coverage;
    cloud = smoothstep(threshold, threshold + u_softness, cloud);

    float heightInCloud = uv.y * 0.6 + cloud * 0.4;
    vec3 cloudColor = cloudLighting(cloud, heightInCloud, sunAlt, warmth, nightFactor, uv);

    vec3 hazeColor = mix(vec3(0.05, 0.06, 0.1), vec3(0.6, 0.7, 0.85), daylight);
    float hazeAmount = layerDepth * layerDepth * 0.5;
    cloudColor = mix(cloudColor, hazeColor, hazeAmount);

    float contrastReduction = 1.0 - layerDepth * 0.3;
    cloudColor = mix(vec3(0.5), cloudColor, contrastReduction);

    float alpha = cloud * u_density * (0.6 + (1.0 - layerDepth) * 0.4);
    color = mix(color, cloudColor, alpha * (1.0 - accumulatedAlpha));
    accumulatedAlpha = accumulatedAlpha + alpha * (1.0 - accumulatedAlpha);
  }

  // Preserve cloud opacity as alpha so later passes can keep the mask intact
  // (for god rays / atmospheric post-processing).
  fragColor = vec4(color, accumulatedAlpha);
}

