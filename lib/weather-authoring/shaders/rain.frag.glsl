#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_sceneTexture;
uniform float u_glassIntensity;
uniform float u_glassZoom;
uniform float u_fallingIntensity;
uniform float u_fallingSpeed;
uniform float u_fallingAngle;
uniform float u_fallingStreakLength;
uniform int u_fallingLayers;
uniform float u_refractionStrength;

#define S(a, b, t) smoothstep(a, b, t)

vec3 N13(float p) {
  vec3 p3 = fract(vec3(p) * vec3(0.1031, 0.11369, 0.13787));
  p3 += dot(p3, p3.yzx + 19.19);
  return fract(vec3((p3.x + p3.y) * p3.z, (p3.x + p3.z) * p3.y, (p3.y + p3.z) * p3.x));
}

float N(float t) {
  return fract(sin(t * 12345.564) * 7658.76);
}

float Saw(float b, float t) {
  return S(0.0, b, t) * S(1.0, b, t);
}

vec2 DropLayer(vec2 uv, float t) {
  vec2 UV = uv;
  uv.y += t * 0.75;
  vec2 aspect = vec2(6.0, 1.0);
  vec2 grid = aspect * 2.0;
  vec2 id = floor(uv * grid);
  float colShift = N(id.x);
  uv.y += colShift;
  id = floor(uv * grid);
  vec3 n = N13(id.x * 35.2 + id.y * 2376.1);
  vec2 st = fract(uv * grid) - vec2(0.5, 0.0);
  float x = n.x - 0.5;
  float y = UV.y * 20.0;
  float wiggle = sin(y + sin(y));
  x += wiggle * (0.5 - abs(x)) * (n.z - 0.5);
  x *= 0.7;
  float ti = fract(t + n.z);
  y = (Saw(0.85, ti) - 0.5) * 0.9 + 0.5;
  vec2 p = vec2(x, y);
  float d = length((st - p) * aspect.yx);
  float mainDrop = S(0.4, 0.0, d);
  float r = sqrt(S(1.0, y, st.y));
  float cd = abs(st.x - x);
  float trail = S(0.23 * r, 0.15 * r * r, cd);
  float trailFront = S(-0.02, 0.02, st.y - y);
  trail *= trailFront * r * r;
  float y2 = fract(UV.y * 10.0) + (st.y - 0.5);
  float dd = length(st - vec2(x, y2));
  float droplets = S(0.3, 0.0, dd);
  float m = mainDrop + droplets * r * trailFront;
  return vec2(m, trail);
}

float StaticDrops(vec2 uv, float t) {
  uv *= 40.0;
  vec2 id = floor(uv);
  uv = fract(uv) - 0.5;
  vec3 n = N13(id.x * 107.45 + id.y * 3543.654);
  vec2 p = (n.xy - 0.5) * 0.7;
  float d = length(uv - p);
  float fade = Saw(0.025, fract(t + n.z));
  float c = S(0.3, 0.0, d) * fract(n.z * 10.0) * fade;
  return c;
}

vec2 Drops(vec2 uv, float t, float l0, float l1, float l2) {
  float s = StaticDrops(uv, t) * l0;
  vec2 m1 = DropLayer(uv, t) * l1;
  vec2 m2 = DropLayer(uv * 1.85, t) * l2;
  float c = s + m1.x + m2.x;
  c = S(0.3, 1.0, c);
  return vec2(c, max(m1.y * l0, m2.y * l1));
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 FallingRainLayer(vec2 uv, float t, float speed, float angle, float streakLen, float scale, float density) {
  vec2 offset = vec2(0.0);
  vec2 p = uv;
  p.x += p.y * angle;
  p *= scale;
  p.y += t * speed;
  vec2 id = floor(p);
  vec2 gv = fract(p) - 0.5;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offs = vec2(float(x), float(y));
      vec2 cellId = id + offs;
      float n1 = hash12(cellId);
      if (n1 > density) continue;
      vec2 n2 = vec2(hash12(cellId * 17.23), hash12(cellId * 31.17));
      vec2 dropPos = offs + n2 - 0.5;
      vec2 localUV = gv - dropPos;
      float streakW = 0.025 + n1 * 0.02;
      float streakH = streakLen * (0.4 + hash12(cellId * 7.13) * 0.6);
      float t_pos = (localUV.y + streakH) / (2.0 * streakH);
      t_pos = clamp(t_pos, 0.0, 1.0);
      if (abs(localUV.y) > streakH * 1.2) continue;
      float taper = mix(1.3, 0.4, t_pos * t_pos);
      float width = streakW * taper;
      float core = S(width, width * 0.2, abs(localUV.x));
      float vertFade = S(0.0, 0.1, t_pos) * S(1.0, 0.85, t_pos);
      float streak = core * vertFade;
      if (streak > 0.001) {
        offset.x += localUV.x * streak * 0.5;
        offset.y += (n1 - 0.5) * streak * 0.1;
      }
    }
  }
  return offset;
}

vec2 FallingRain(vec2 uv, float t) {
  vec2 totalOffset = vec2(0.0);
  if (u_fallingIntensity < 0.01) return totalOffset;

  float speed = u_fallingSpeed * 5.0;
  float streakLen = u_fallingStreakLength * 0.3;

  for (int i = 0; i < 6; i++) {
    if (i >= u_fallingLayers) break;
    float layerIdx = float(i);
    float depth = layerIdx / float(max(u_fallingLayers - 1, 1));
    float layerScale = mix(6.0, 30.0, depth);
    float layerSpeed = speed * mix(2.0, 0.5, depth);
    float layerDensity = u_fallingIntensity * mix(0.8, 0.3, depth);
    float layerStrength = mix(1.0, 0.15, depth);
    float layerStreakLen = streakLen * mix(1.5, 0.4, depth);
    float layerAngle = u_fallingAngle * mix(1.0, 0.6, depth);
    vec2 layerOffset = vec2(sin(layerIdx * 73.156) * 3.0, cos(layerIdx * 37.842) * 3.0);
    vec2 layer = FallingRainLayer(uv + layerOffset, t + layerIdx * 0.13, layerSpeed, layerAngle, layerStreakLen, layerScale, layerDensity);
    totalOffset += layer * layerStrength;
  }
  return totalOffset * 0.4;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
  vec2 UV = v_uv;

  uv *= u_glassZoom;
  float t = u_time * 0.2;

  float rainAmount = u_glassIntensity;
  float staticDrops = S(-0.5, 1.0, rainAmount) * 2.0;
  float layer1 = S(0.25, 0.75, rainAmount);
  float layer2 = S(0.0, 0.5, rainAmount);

  vec2 c = Drops(uv, t, staticDrops, layer1, layer2);

  vec2 e = vec2(0.001, 0.0);
  float cx = Drops(uv + e, t, staticDrops, layer1, layer2).x;
  float cy = Drops(uv + e.yx, t, staticDrops, layer1, layer2).x;
  vec2 glassNormal = vec2(cx - c.x, cy - c.x);

  vec2 fallingRainOffset = FallingRain(uv, u_time);

  vec2 totalRefraction = (glassNormal + fallingRainOffset) * u_refractionStrength;

  vec2 refractedUV = UV + totalRefraction;
  refractedUV = clamp(refractedUV, 0.0, 1.0);

  vec4 scene = texture(u_sceneTexture, refractedUV);
  vec3 color = scene.rgb;

  // Subtle specular on rain
  float rainMagnitude = length(fallingRainOffset);
  if (rainMagnitude > 0.001) {
    float brightness = dot(scene.rgb, vec3(0.299, 0.587, 0.114));
    float specular = rainMagnitude * 15.0 * (0.1 + brightness * 0.9);
    color += vec3(0.8, 0.85, 0.95) * specular * 0.3;
  }

  color += vec3(0.1, 0.12, 0.15) * c.x * 0.5;

  fragColor = vec4(color, scene.a);
}

