#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_sceneTexture;
uniform bool u_enabled;
uniform float u_flashIntensity;
uniform float u_branchDensity;
uniform float u_sceneIllumination;
uniform float u_lastFlashTime;
uniform float u_strikeSeed;

#define MAX_SEGMENTS 32
#define MAX_BRANCHES 16
#define PI 3.14159265359

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

float distToSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

vec2 displacedPoint(vec2 start, vec2 end, float t, float seed, float displacementAmt) {
  vec2 basePoint = mix(start, end, t);
  vec2 dir = end - start;
  vec2 perp = normalize(vec2(-dir.y, dir.x));
  float envelope = sin(t * PI);
  float n1 = noise(vec2(t * 8.0, seed * 100.0)) * 2.0 - 1.0;
  float n2 = noise(vec2(t * 16.0, seed * 100.0 + 50.0)) * 2.0 - 1.0;
  float n3 = noise(vec2(t * 32.0, seed * 100.0 + 100.0)) * 2.0 - 1.0;
  float displacement = (n1 * 0.6 + n2 * 0.3 + n3 * 0.1) * envelope * displacementAmt;
  float targetBias = 1.0 - t * 0.3;
  displacement *= targetBias;
  return basePoint + perp * displacement * length(dir);
}

float mainBoltDistance(vec2 uv, vec2 start, vec2 end, float seed, float displacementAmt) {
  float minDist = 999.0;
  vec2 prevPoint = start;
  for (int i = 1; i <= MAX_SEGMENTS; i++) {
    float t = float(i) / float(MAX_SEGMENTS);
    vec2 currPoint = displacedPoint(start, end, t, seed, displacementAmt);
    float d = distToSegment(uv, prevPoint, currPoint);
    minDist = min(minDist, d);
    prevPoint = currPoint;
  }
  return minDist;
}

float branchDistance(vec2 uv, vec2 branchStart, vec2 branchDir, float branchLen, float seed, float displacementAmt) {
  vec2 branchEnd = branchStart + branchDir * branchLen;
  float minDist = 999.0;
  vec2 prevPoint = branchStart;
  for (int i = 1; i <= 12; i++) {
    float t = float(i) / 12.0;
    vec2 currPoint = displacedPoint(branchStart, branchEnd, t, seed, displacementAmt * 0.7);
    float d = distToSegment(uv, prevPoint, currPoint);
    minDist = min(minDist, d);
    prevPoint = currPoint;
  }
  return minDist;
}

vec2 branchesDistance(vec2 uv, vec2 start, vec2 end, float seed, float displacementAmt, float density) {
  float minDist = 999.0;
  float brightness = 0.0;
  vec2 mainDir = normalize(end - start);
  float mainLen = length(end - start);

  for (int i = 0; i < MAX_BRANCHES; i++) {
    float idx = float(i);
    float branchT = 0.15 + hash11(seed + idx * 7.31) * 0.7;
    float branchProb = (1.0 - branchT) * density;
    if (hash11(seed + idx * 3.17) > branchProb) continue;

    vec2 branchStart = displacedPoint(start, end, branchT, seed, displacementAmt);
    float angleOffset = (hash11(seed + idx * 11.13) * 2.0 - 1.0) * 0.6;
    float side = hash11(seed + idx * 5.71) > 0.5 ? 1.0 : -1.0;
    float angle = atan(mainDir.y, mainDir.x) + side * (0.3 + abs(angleOffset) * 0.5);
    vec2 branchDir = vec2(cos(angle), sin(angle));
    float branchLen = mainLen * (0.15 + hash11(seed + idx * 13.37) * 0.25);

    float d = branchDistance(uv, branchStart, branchDir, branchLen, seed + idx * 100.0, displacementAmt);
    if (d < minDist) {
      minDist = d;
      brightness = 0.5 - branchT * 0.2;
    }

    if (density > 0.3 && hash11(seed + idx * 17.19) < density * 0.5) {
      float subT = 0.3 + hash11(seed + idx * 19.23) * 0.4;
      vec2 subStart = branchStart + branchDir * branchLen * subT;
      float subAngle = angle + (hash11(seed + idx * 23.29) * 2.0 - 1.0) * 0.5;
      vec2 subDir = vec2(cos(subAngle), sin(subAngle));
      float subLen = branchLen * 0.4;
      float subD = branchDistance(uv, subStart, subDir, subLen, seed + idx * 200.0, displacementAmt * 0.5);
      if (subD < minDist) {
        minDist = subD;
        brightness = 0.25;
      }
    }
  }
  return vec2(minDist, brightness);
}

vec3 lightningGlow(float dist, float brightness, float intensity, float thickness) {
  float scaledDist = dist / max(thickness, 0.1);
  float core = smoothstep(0.003, 0.0, scaledDist) * brightness;
  float innerGlow = exp(-scaledDist * 150.0) * brightness;
  float outerGlow = exp(-dist * dist * 3000.0) * brightness * thickness;

  vec3 coreColor = vec3(1.0, 1.0, 1.0);
  vec3 innerColor = vec3(0.7, 0.8, 1.0);
  vec3 outerColor = vec3(0.5, 0.5, 0.9);

  vec3 color = coreColor * core * 2.0;
  color += innerColor * innerGlow * 0.8;
  color += outerColor * outerGlow * 0.5;
  return color * intensity;
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

void main() {
  vec4 scene = texture(u_sceneTexture, v_uv);

  if (!u_enabled) {
    fragColor = scene;
    return;
  }

  vec2 uv = v_uv;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float timeSinceStrike = u_time - u_lastFlashTime;
  float durationSec = 0.8;

  float flash = restrikeEnvelope(timeSinceStrike, durationSec, u_strikeSeed);
  float afterimageDuration = durationSec * 1.5;
  float afterimageT = clamp(timeSinceStrike / afterimageDuration, 0.0, 1.0);
  float afterimage = timeSinceStrike < 0.0 ? 0.0 : (1.0 - easeInSine(afterimageT));

  vec3 color = scene.rgb;

  if (flash > 0.01 || afterimage > 0.01) {
    vec2 strikeHash = hash22(vec2(u_strikeSeed * 123.456, u_strikeSeed * 789.012));
    vec2 boltStart = vec2((0.3 + strikeHash.x * 0.4) * aspect, 1.05);
    vec2 boltEnd = vec2(boltStart.x + (strikeHash.x - 0.5) * 0.4, -0.05);

    float straightDist = distToSegment(uv, boltStart, boltEnd);

    // Always apply the broad source glow (cheap). If this is inside the early-out
    // region it will get hard-clipped and look like a visible “container” around
    // the bolt.
    float sourceGlow = exp(-length(uv - boltStart) * 3.0);
    color += vec3(0.4, 0.45, 0.6) * sourceGlow * afterimage * 0.3;

    // Cheap early-out: most pixels are far from the bolt path.
    // This avoids running the expensive segment/branch distance loops when the
    // contribution would be effectively zero.
    float distLimit = 0.18 + u_branchDensity * 0.25 + u_flashIntensity * 0.05;
    float feather = 0.08;
    float region = 1.0 - smoothstep(distLimit - feather, distLimit, straightDist);
    if (region <= 0.0005) {
      fragColor = vec4(color, scene.a);
      return;
    }

    float displacementAmt = 0.15;
    float mainDist = mainBoltDistance(uv, boltStart, boltEnd, u_strikeSeed, displacementAmt);
    vec2 branchResult = branchesDistance(uv, boltStart, boltEnd, u_strikeSeed, displacementAmt, u_branchDensity);
    float branchDist = branchResult.x;
    float branchBrightness = branchResult.y;

    float mainThickness = mix(0.2, 1.0, easeOutSine(sqrt(max(flash, 0.0))));
    vec3 afterglowColor = vec3(0.5, 0.45, 0.7);

    vec3 mainCore = lightningGlow(mainDist, easeOutQuad(max(flash, 0.0)), u_flashIntensity, mainThickness);
    float mainAfterglowDist = mainDist * 0.6;
    float mainAfterglowStrength = exp(-mainAfterglowDist * 50.0) * afterimage * 0.5;
    vec3 mainAfterglow = afterglowColor * mainAfterglowStrength;

    float branchThickness = mix(0.15, 1.0, easeOutSine(max(flash, 0.0)));
    vec3 branchCore = lightningGlow(branchDist, branchBrightness * easeOutQuad(max(flash, 0.0)), u_flashIntensity, branchThickness);
    float branchAfterglowDist = branchDist * 0.7;
    float branchAfterglowStrength = exp(-branchAfterglowDist * 80.0) * branchBrightness * afterimage * 0.4;
    vec3 branchAfterglow = afterglowColor * branchAfterglowStrength;

    color += (mainCore + branchCore) * max(flash, 0.0) * region;
    color += (mainAfterglow + branchAfterglow) * afterimage * region;
  }

  fragColor = vec4(color, scene.a);
}

