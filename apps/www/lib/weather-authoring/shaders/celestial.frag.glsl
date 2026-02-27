#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_timeOfDay;
uniform float u_moonPhase;
uniform float u_starDensity;
uniform vec2 u_celestialPos;
uniform float u_sunSize;
uniform float u_moonSize;
uniform float u_sunGlowIntensity;
uniform float u_sunGlowSize;
uniform float u_sunRayCount;
uniform float u_sunRayLength;
uniform float u_sunRayIntensity;
uniform float u_sunRayShimmer;
uniform float u_sunRayShimmerSpeed;
uniform float u_moonGlowIntensity;
uniform float u_moonGlowSize;
uniform float u_skyBrightness;
uniform float u_skySaturation;
uniform float u_skyContrast;
uniform sampler2D u_moonTexture;
uniform bool u_hasMoonTexture;

#define PI 3.14159265359
#define GODRAY_MAX_SAMPLES 32
#define TAU 6.28318530718

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
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
  float frequency = 1.0;
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    value += amplitude * noise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

// Calculate sun Y position based on time of day
// Sun rises 0.18-0.32, visible during day, sets 0.68-0.82
// Note: UV y=0 is bottom, y=1 is top, so below horizon means y < 0
float getSunY(float timeOfDay, float baseY) {
  float belowHorizon = -0.25;
  float riseProgress = smoothstep(0.18, 0.32, timeOfDay);
  float setProgress = smoothstep(0.68, 0.82, timeOfDay);
  float visible = riseProgress * (1.0 - setProgress);
  return mix(belowHorizon, baseY, visible);
}

// Calculate moon Y position based on time of day
// Moon sets 0.12-0.26 (overlaps slightly with sun rise)
// Moon rises 0.74-0.88 (overlaps slightly with sun set)
// During overlap both are near horizon so both faded = subtle handoff
float getMoonY(float timeOfDay, float baseY) {
  float belowHorizon = -0.25;
  float risingEvening = smoothstep(0.74, 0.88, timeOfDay);
  float settingMorning = 1.0 - smoothstep(0.12, 0.26, timeOfDay);
  float visible = max(risingEvening, settingMorning);
  return mix(belowHorizon, baseY, visible);
}

// Fade opacity near horizon for smooth edge (bottom of screen)
// Extended range so bodies visible earlier in their rise
float getHorizonFade(float y) {
  return smoothstep(-0.2, 0.0, y);
}

vec3 getSkyColor(vec2 uv, float timeOfDay) {
  vec3 dayTop = vec3(0.4, 0.6, 0.9);
  vec3 dayHorizon = vec3(0.7, 0.8, 0.95);
  vec3 sunsetTop = vec3(0.2, 0.2, 0.4);
  vec3 sunsetHorizon = vec3(0.9, 0.5, 0.2);
  vec3 nightTop = vec3(0.02, 0.02, 0.05);
  vec3 nightHorizon = vec3(0.05, 0.05, 0.1);

  float dayAmount = smoothstep(0.25, 0.4, timeOfDay) * smoothstep(0.75, 0.6, timeOfDay);
  float sunsetAmount = max(
    smoothstep(0.2, 0.3, timeOfDay) * smoothstep(0.4, 0.3, timeOfDay),
    smoothstep(0.6, 0.7, timeOfDay) * smoothstep(0.8, 0.7, timeOfDay)
  );
  float nightAmount = max(0.0, 1.0 - dayAmount - sunsetAmount);

  float gradientFactor = pow(1.0 - uv.y, 1.0);

  vec3 topColor = dayTop * dayAmount + sunsetTop * sunsetAmount + nightTop * nightAmount;
  vec3 horizonColor = dayHorizon * dayAmount + sunsetHorizon * sunsetAmount + nightHorizon * nightAmount;

  vec3 avgColor = (topColor + horizonColor) * 0.5;
  topColor = mix(avgColor, topColor, u_skyContrast);
  horizonColor = mix(avgColor, horizonColor, u_skyContrast);

  vec3 color = mix(topColor, horizonColor, gradientFactor);

  color *= u_skyBrightness;

  float gray = dot(color, vec3(0.299, 0.587, 0.114));
  if (u_skySaturation <= 1.0) {
    color = mix(vec3(gray), color, u_skySaturation);
  } else {
    float boost = u_skySaturation - 1.0;
    color = color + (color - vec3(gray)) * boost;
  }

  return clamp(color, 0.0, 1.0);
}

float drawStars(vec2 uv, float density, float time) {
  float stars = 0.0;
  for (int layer = 0; layer < 3; layer++) {
    float layerScale = 100.0 + float(layer) * 50.0;
    vec2 gridUV = uv * layerScale;
    vec2 gridID = floor(gridUV);
    vec2 gridFract = fract(gridUV);
    vec2 starPos = hash2(gridID + float(layer) * 100.0);
    float dist = length(gridFract - starPos);
    float starPresent = step(1.0 - density * 0.3, hash(gridID * (float(layer) + 1.0)));
    float starSize = 0.02 + hash(gridID.yx) * 0.03;
    float twinkle = sin(time * (2.0 + hash(gridID) * 3.0) + hash(gridID.yx) * TAU) * 0.3 + 0.7;
    float star = smoothstep(starSize, 0.0, dist) * starPresent * twinkle;
    star *= 1.0 - float(layer) * 0.3;
    stars += star;
  }
  return stars;
}

vec3 drawSun(vec2 uv, vec2 sunPos, float size) {
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 diff = (uv - sunPos) * aspect;
  float dist = length(diff);
  float angle = atan(diff.y, diff.x);

  float disc = 1.0 - smoothstep(size * 0.9, size, dist);

  vec3 sunCore = vec3(1.0, 1.0, 0.95);
  vec3 sunEdge = vec3(1.0, 0.9, 0.4);
  float edgeFactor = clamp(dist / size, 0.0, 1.0);
  vec3 sunColor = mix(sunCore, sunEdge, edgeFactor);

  float limbDarkening = 1.0 - pow(clamp(dist / size, 0.0, 1.0), 2.0) * 0.3;
  sunColor *= limbDarkening;

  float glowSize = max(0.1, u_sunGlowSize);
  float scaledDist = dist / glowSize;
  float glow1 = exp(-scaledDist * 8.0) * 0.5;
  float glow2 = exp(-scaledDist * 3.0) * 0.3;
  float glow3 = exp(-scaledDist * 1.5) * 0.15;

  vec3 glowColor = vec3(1.0, 0.8, 0.4);
  float glowTotal = (glow1 + glow2 + glow3) * u_sunGlowIntensity;

  vec3 result = sunColor * disc * 2.0;
  result += glowColor * glowTotal;

  // ---------------------------------------------------------------------------
  // Prismatic flare + rays
  // ---------------------------------------------------------------------------
  // Keep these effects subtle and mostly white — we want "eye optics" more than
  // sci-fi neon. The rainbow shows up as a gentle chromatic fringe on very
  // bright highlights.

  // A thin, slightly prismatic halo ring around the sun.
  float ringCenter = size * 1.15;
  float ringWidth = max(size * 0.35, 0.001);
  float ringMask = smoothstep(size * 0.85, size * 1.05, dist);
  ringMask *= 1.0 - smoothstep(size * 5.0, size * 9.0, dist);

  // Chromatic dispersion grows slightly with distance from the disc.
  float chromaShift = size * (0.012 + u_sunRayIntensity * 0.06);
  chromaShift *= smoothstep(size * 0.9, size * 2.4, dist);

  float ringR = exp(-pow((dist - chromaShift - ringCenter) / ringWidth, 2.0));
  float ringG = exp(-pow((dist - ringCenter) / ringWidth, 2.0));
  float ringB = exp(-pow((dist + chromaShift - ringCenter) / ringWidth, 2.0));

  // Desaturated spectrum-ish tint (mostly white).
  float ringT = clamp((dist - size) / (size * 2.2), 0.0, 1.0);
  vec3 ringSpectral = 0.55 + 0.45 * cos(TAU * (ringT + vec3(0.0, 0.33, 0.67)));
  ringSpectral = clamp(ringSpectral, 0.0, 1.0);
  vec3 ringColor = mix(vec3(1.0), ringSpectral, 0.45);

  float ringIntensity = (ringR + ringG + ringB) / 3.0;
  ringIntensity *= ringMask * u_sunGlowIntensity * 0.025;
  result += ringColor * ringIntensity;

  // Sun rays (diffraction spikes) with gentle shimmer/breath.
  if (u_sunRayCount > 0.0 && u_sunRayIntensity > 0.0) {
    // Rays are only visible close to the disc; bail early for perf.
    if (dist < size * 3.6) {
      float motion = clamp(u_sunRayShimmer, 0.0, 5.0);
      float t = u_time * max(0.0, u_sunRayShimmerSpeed);

      float rayPhase = angle * u_sunRayCount;
      float rayIndex = floor(rayPhase / PI + 0.5);
      float raySeed = hash(vec2(rayIndex, 19.17));

      // Major rays + faint minor spikes (iris/eyelash diffraction).
      float major = pow(abs(cos(rayPhase)), 10.0);
      float minor = pow(abs(cos(rayPhase * 2.0 + raySeed * 2.3)), 22.0) * 0.18;
      float rayShape = max(major, minor);

      // Per-ray breathing (very slow) + along-ray shimmer (slightly faster).
      float breathe =
        1.0 +
        (noise(vec2(t * 0.05, raySeed * 7.0)) - 0.5) * (0.08 * motion);
      float shimmer =
        1.0 +
        (noise(vec2(dist * 12.0 - t * 0.25, raySeed * 23.0)) - 0.5) *
          (0.12 * motion);
      float micro =
        1.0 +
        (noise(vec2(t * 0.6, rayPhase * 0.8)) - 0.5) * (0.06 * motion);

      float rayNoise =
        0.72 +
        0.28 * noise(vec2(rayPhase * 0.35, t * 0.12 + raySeed * 10.0));
      float rayPattern = rayShape * rayNoise;

      float rayStart = smoothstep(size * 0.75, size * 1.25, dist);
      float rayEnd = smoothstep(size * (3.0 * breathe), size * 1.5, dist);

      float rayLengthVar = 0.75 + raySeed * 0.55;
      float maxRayDist = max(0.001, u_sunRayLength * 0.15);
      float rayFalloff = exp(
        -dist * dist / (maxRayDist * maxRayDist * rayLengthVar * breathe)
      );

      float rays = rayPattern * rayFalloff * rayStart * rayEnd * u_sunRayIntensity;
      rays *= shimmer * micro;

      // Chromatic fringe: compute a slightly different falloff per channel.
      float prismMask = smoothstep(size * 1.05, size * 2.6, dist);
      float rayChroma = size * (0.01 + u_sunRayIntensity * 0.05) * prismMask;

      float distR = max(0.0, dist - rayChroma);
      float distB = dist + rayChroma;

      float falloffR = exp(
        -distR * distR / (maxRayDist * maxRayDist * rayLengthVar * breathe)
      );
      float falloffG = rayFalloff;
      float falloffB = exp(
        -distB * distB / (maxRayDist * maxRayDist * rayLengthVar * breathe)
      );

      vec3 rayRGB = vec3(falloffR, falloffG, falloffB) * rayPattern * rayStart * rayEnd;
      float rayAvg = (rayRGB.r + rayRGB.g + rayRGB.b) / 3.0;
      vec3 rayChromaColor = rayRGB / max(rayAvg, 1e-4);

      // Add a very subtle spectrum tint so the fringe reads as "rainbow-like",
      // without turning into a colorful fantasy effect.
      float rayT = clamp((dist - size) / (size * 2.6), 0.0, 1.0);
      vec3 raySpectral = 0.55 + 0.45 * cos(TAU * (rayT + vec3(0.0, 0.33, 0.67)));
      raySpectral = clamp(raySpectral, 0.0, 1.0);
      raySpectral = mix(vec3(1.0), raySpectral, 0.28);

      vec3 rayWarm = vec3(1.0, 0.92, 0.7);
      float prismMix = clamp(0.08 + u_sunRayIntensity * 0.6, 0.0, 0.45) * prismMask;
      vec3 rayColor = mix(rayWarm, rayChromaColor, prismMix);
      rayColor = mix(rayColor, raySpectral, prismMix * 0.65);

      result += rayColor * rays;
    }
  }

  return result;
}

vec3 getSphereNormal(vec2 discUV) {
  float r2 = dot(discUV, discUV);
  if (r2 > 1.0) return vec3(0.0);
  float z = sqrt(1.0 - r2);
  return normalize(vec3(discUV.x, discUV.y, z));
}

vec2 sphereToEquirectangular(vec3 normal) {
  float longitude = atan(normal.x, normal.z);
  float u = longitude / TAU + 0.5;
  float latitude = asin(clamp(normal.y, -1.0, 1.0));
  float v = latitude / PI + 0.5;
  return vec2(u, v);
}

vec3 getMoonSurfaceColor(vec3 normal, vec2 discUV) {
  if (u_hasMoonTexture) {
    vec2 texUV = sphereToEquirectangular(normal);
    return texture(u_moonTexture, texUV).rgb;
  }
  float brightness = 0.7 + fbm(discUV * 5.0, 3) * 0.3;
  return vec3(brightness * 0.85, brightness * 0.83, brightness * 0.8);
}

vec4 drawMoon(vec2 uv, vec2 moonPos, float size, float phase) {
  vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
  vec2 diff = (uv - moonPos) * aspect;
  float dist = length(diff);

  vec2 discUV = diff / size;
  float discDist = length(discUV);
  float disc = 1.0 - smoothstep(0.95, 1.0, discDist);

  float glowSize = max(0.1, u_moonGlowSize);
  float glowIntensity = u_moonGlowIntensity;

  if (disc < 0.001) {
    float scaledDist = dist / glowSize;
    float glow1 = exp(-scaledDist * 6.0) * 0.15;
    float glow2 = exp(-scaledDist * 2.0) * 0.06;
    vec3 glowColor = vec3(0.8, 0.85, 0.95);
    float phaseAngle = phase * TAU;
    vec3 sunDir = vec3(sin(phaseAngle), 0.0, -cos(phaseAngle));
    float glowPhase = max(0.2, dot(normalize(vec3(discUV, 0.5)), sunDir) * 0.5 + 0.5);
    return vec4(glowColor * (glow1 + glow2) * glowPhase * glowIntensity, 0.0);
  }

  vec3 normal = getSphereNormal(discUV);
  float phaseAngle = phase * TAU;
  vec3 sunDir = vec3(sin(phaseAngle), 0.0, -cos(phaseAngle));
  float NdotL = dot(normal, sunDir);
  float terminator = smoothstep(-0.02, 0.08, NdotL);

  vec3 baseColor = getMoonSurfaceColor(normal, discUV);
  vec3 ambient = baseColor * 0.03;
  vec3 lit = baseColor * terminator;
  vec3 moonSurface = ambient + lit;

  float limbDarkening = 1.0 - pow(discDist, 3.0) * 0.15;
  moonSurface *= limbDarkening;

  float rimLight = pow(1.0 - abs(NdotL), 4.0) * terminator * 0.1;
  moonSurface += vec3(1.0, 0.98, 0.95) * rimLight;

  float scaledDist = dist / glowSize;
  float glow1 = exp(-scaledDist * 6.0) * 0.12;
  float glow2 = exp(-scaledDist * 2.0) * 0.06;
  vec3 glowColor = vec3(0.8, 0.85, 0.95);
  float litAmount = max(0.1, terminator);
  vec3 glow = glowColor * (glow1 + glow2) * litAmount * glowIntensity;

  return vec4(moonSurface * disc + glow, disc);
}

void main() {
  vec2 uv = v_uv;

  vec3 color = getSkyColor(uv, u_timeOfDay);

  // Calculate separate Y positions for sun and moon
  float sunY = getSunY(u_timeOfDay, u_celestialPos.y);
  float moonY = getMoonY(u_timeOfDay, u_celestialPos.y);
  vec2 sunPos = vec2(u_celestialPos.x, sunY);
  vec2 moonPos = vec2(u_celestialPos.x, moonY);

  // Stars visible when moon is up (night time)
  float moonFade = getHorizonFade(moonY);
  if (moonFade > 0.01) {
    float stars = drawStars(uv, u_starDensity, u_time);
    color += vec3(stars) * moonFade;
  }

  // Draw sun with horizon fade
  float sunFade = getHorizonFade(sunY);
  if (sunFade > 0.01) {
    vec3 sun = drawSun(uv, sunPos, u_sunSize);
    color += sun * sunFade;
  }

  // Draw moon with horizon fade
  if (moonFade > 0.01) {
    vec4 moon = drawMoon(uv, moonPos, u_moonSize, u_moonPhase);
    float alpha = moon.a * moonFade;
    color = mix(color, moon.rgb, alpha) + moon.rgb * (1.0 - moon.a) * moonFade;
  }

  // Alpha is reserved for a cloud-occlusion mask (used by post-processing like
  // crepuscular rays). The celestial pass contains no cloud coverage, so it
  // writes 0.
  fragColor = vec4(color, 0.0);
}

