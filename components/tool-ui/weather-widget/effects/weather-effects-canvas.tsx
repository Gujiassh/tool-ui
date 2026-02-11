"use client";

import { useEffect, useRef, useCallback } from "react";
import {
  __resetWeatherWebglCanvasBudgetForTests,
  getAllocatedWeatherWebglCanvasCount,
  getMaxConcurrentWeatherWebglCanvases,
  releaseWeatherWebglBudgetSlotOnInitFailure,
  releaseWeatherWebglCanvasBudgetSlot,
  setMaxConcurrentWeatherWebglCanvases,
  tryAcquireWeatherWebglCanvasBudgetSlot,
} from "./weather-webgl-budget";
import {
  CELESTIAL_FRAGMENT,
  CLOUD_FRAGMENT,
  COMPOSITE_FRAGMENT,
  FULLSCREEN_VERTEX,
  LIGHTNING_FRAGMENT,
  RAIN_FRAGMENT,
  SNOW_FRAGMENT,
} from "./weather-effect-shaders";
import {
  createFramebuffer,
  createProgram,
  resizeFramebuffer,
  type Framebuffer,
} from "./weather-effect-gl";
import {
  clearOffscreenPass,
  isLightningPassActive,
  renderCelestialPass,
  renderCloudPass,
  renderCompositePass,
  renderLightningPass,
  renderRainPass,
  renderSnowPass,
} from "./weather-effect-render-passes";
import {
  DEFAULT_CELESTIAL,
  DEFAULT_CLOUD,
  DEFAULT_INTERACTIONS,
  DEFAULT_LAYERS,
  DEFAULT_LIGHTNING,
  DEFAULT_POST,
  DEFAULT_RAIN,
  DEFAULT_SNOW,
} from "./weather-effects-defaults";
import type {
  WeatherEffectsCanvasProps,
} from "./weather-effects-types";

export type {
  CelestialParams,
  CloudParams,
  InteractionParams,
  LayerToggles,
  LightningParams,
  PostProcessParams,
  RainParams,
  SnowParams,
  WeatherEffectsCanvasProps,
} from "./weather-effects-types";

// =============================================================================
// WEBGL HELPERS
// =============================================================================

export {
  __resetWeatherWebglCanvasBudgetForTests,
  getAllocatedWeatherWebglCanvasCount,
  getMaxConcurrentWeatherWebglCanvases,
  releaseWeatherWebglBudgetSlotOnInitFailure,
  releaseWeatherWebglCanvasBudgetSlot,
  setMaxConcurrentWeatherWebglCanvases,
  tryAcquireWeatherWebglCanvasBudgetSlot,
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function WeatherEffectsCanvas({
  className,
  dpr: dprProp,
  layers: layersProp,
  celestial: celestialProp,
  cloud: cloudProp,
  rain: rainProp,
  lightning: lightningProp,
  snow: snowProp,
  interactions: interactionsProp,
  post: postProp,
}: WeatherEffectsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const lastFlashTimeRef = useRef<number>(-100);
  const nextFlashTimeRef = useRef<number>(0);
  const strikeSeedRef = useRef<number>(0);
  const moonTextureRef = useRef<WebGLTexture | null>(null);
  const moonTextureLoadedRef = useRef<boolean>(false);
  const positionBufferRef = useRef<WebGLBuffer | null>(null);
  const uniformLocationCacheRef = useRef<
    WeakMap<WebGLProgram, Map<string, WebGLUniformLocation | null>>
  >(new WeakMap());
  const isVisibleRef = useRef<boolean>(false);
  const isRunningRef = useRef<boolean>(false);
  const isContextLostRef = useRef<boolean>(false);
  const initFailedRef = useRef<boolean>(false);
  const hasWebglBudgetSlotRef = useRef<boolean | null>(null);

  // Programs
  const programsRef = useRef<{
    celestial: WebGLProgram | null;
    cloud: WebGLProgram | null;
    rain: WebGLProgram | null;
    lightning: WebGLProgram | null;
    snow: WebGLProgram | null;
    composite: WebGLProgram | null;
  }>({
    celestial: null,
    cloud: null,
    rain: null,
    lightning: null,
    snow: null,
    composite: null,
  });

  // Framebuffers (ping-pong)
  const fbRef = useRef<{
    a: Framebuffer | null;
    b: Framebuffer | null;
  }>({ a: null, b: null });

  // Store props in ref for render loop
  const propsRef = useRef({
    layers: { ...DEFAULT_LAYERS, ...layersProp },
    celestial: { ...DEFAULT_CELESTIAL, ...celestialProp },
    cloud: { ...DEFAULT_CLOUD, ...cloudProp },
    rain: { ...DEFAULT_RAIN, ...rainProp },
    lightning: { ...DEFAULT_LIGHTNING, ...lightningProp },
    snow: { ...DEFAULT_SNOW, ...snowProp },
    interactions: { ...DEFAULT_INTERACTIONS, ...interactionsProp },
    post: { ...DEFAULT_POST, ...postProp },
    dpr: dprProp,
  });

  propsRef.current = {
    layers: { ...DEFAULT_LAYERS, ...layersProp },
    celestial: { ...DEFAULT_CELESTIAL, ...celestialProp },
    cloud: { ...DEFAULT_CLOUD, ...cloudProp },
    rain: { ...DEFAULT_RAIN, ...rainProp },
    lightning: { ...DEFAULT_LIGHTNING, ...lightningProp },
    snow: { ...DEFAULT_SNOW, ...snowProp },
    interactions: { ...DEFAULT_INTERACTIONS, ...interactionsProp },
    post: { ...DEFAULT_POST, ...postProp },
    dpr: dprProp,
  };

  const getUniformLocationCached = useCallback(
    (gl: WebGL2RenderingContext, program: WebGLProgram, name: string) => {
      let programCache = uniformLocationCacheRef.current.get(program);
      if (!programCache) {
        programCache = new Map();
        uniformLocationCacheRef.current.set(program, programCache);
      }

      const cached = programCache.get(name);
      if (cached !== undefined) {
        return cached;
      }

      const location = gl.getUniformLocation(program, name);
      programCache.set(name, location);
      return location;
    },
    [],
  );

  const stopRenderLoop = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }
    isRunningRef.current = false;
  }, []);

  const disposeGL = useCallback(() => {
    stopRenderLoop();

    const gl = glRef.current;
    const isContextLost = isContextLostRef.current;

    if (gl && !isContextLost) {
      // Programs
      for (const program of Object.values(programsRef.current)) {
        if (program) gl.deleteProgram(program);
      }

      // Ping-pong framebuffers + textures
      for (const fb of [fbRef.current.a, fbRef.current.b]) {
        if (!fb) continue;
        gl.deleteFramebuffer(fb.fbo);
        gl.deleteTexture(fb.texture);
      }

      // Moon texture
      if (moonTextureRef.current) {
        gl.deleteTexture(moonTextureRef.current);
      }

      // Fullscreen quad buffer
      if (positionBufferRef.current) {
        gl.deleteBuffer(positionBufferRef.current);
      }
    }

    // Clear refs regardless (context-loss-safe).
    programsRef.current = {
      celestial: null,
      cloud: null,
      rain: null,
      lightning: null,
      snow: null,
      composite: null,
    };
    fbRef.current = { a: null, b: null };
    moonTextureRef.current = null;
    moonTextureLoadedRef.current = false;
    positionBufferRef.current = null;
    glRef.current = null;
    uniformLocationCacheRef.current = new WeakMap();
  }, [stopRenderLoop]);

  const initGL = useCallback(() => {
    if (initFailedRef.current) return false;

    const canvas = canvasRef.current;
    if (!canvas) return false;

    if (hasWebglBudgetSlotRef.current === false) return false;
    if (hasWebglBudgetSlotRef.current === null) {
      const ok = tryAcquireWeatherWebglCanvasBudgetSlot(canvas);
      if (!ok) {
        hasWebglBudgetSlotRef.current = false;
        if (process.env.NODE_ENV !== "production") {
          console.warn(
            "[WeatherEffectsCanvas] Too many WebGL canvases on the page; rendering this widget without effects.",
          );
        }
        return false;
      }
      hasWebglBudgetSlotRef.current = true;
    }

    // Re-init safely.
    disposeGL();
    isContextLostRef.current = false;

    const gl = canvas.getContext("webgl2");
    if (!gl) {
      initFailedRef.current = true;
      hasWebglBudgetSlotRef.current = releaseWeatherWebglBudgetSlotOnInitFailure(
        canvas,
        hasWebglBudgetSlotRef.current,
      );
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[WeatherEffectsCanvas] WebGL2 not supported; rendering without effects.",
        );
      }
      return false;
    }
    glRef.current = gl;
    if (gl.isContextLost()) {
      isContextLostRef.current = true;
      disposeGL();
      hasWebglBudgetSlotRef.current = releaseWeatherWebglBudgetSlotOnInitFailure(
        canvas,
        hasWebglBudgetSlotRef.current,
      );
      return false;
    }

    // Create programs
    programsRef.current.celestial = createProgram(
      gl,
      FULLSCREEN_VERTEX,
      CELESTIAL_FRAGMENT,
    );
    programsRef.current.cloud = createProgram(
      gl,
      FULLSCREEN_VERTEX,
      CLOUD_FRAGMENT,
    );
    programsRef.current.rain = createProgram(
      gl,
      FULLSCREEN_VERTEX,
      RAIN_FRAGMENT,
    );
    programsRef.current.lightning = createProgram(
      gl,
      FULLSCREEN_VERTEX,
      LIGHTNING_FRAGMENT,
    );
    programsRef.current.snow = createProgram(
      gl,
      FULLSCREEN_VERTEX,
      SNOW_FRAGMENT,
    );
    programsRef.current.composite = createProgram(
      gl,
      FULLSCREEN_VERTEX,
      COMPOSITE_FRAGMENT,
    );

    // Require at least a sky + final composite so we can render something.
    if (!programsRef.current.celestial || !programsRef.current.composite) {
      if (gl.isContextLost()) {
        isContextLostRef.current = true;
      } else {
        initFailedRef.current = true;
        console.error("Failed to create required WebGL programs");
      }
      disposeGL();
      hasWebglBudgetSlotRef.current = releaseWeatherWebglBudgetSlotOnInitFailure(
        canvas,
        hasWebglBudgetSlotRef.current,
      );
      return false;
    }

    // Create framebuffers
    const dpr = propsRef.current.dpr ?? window.devicePixelRatio;
    const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    const fbA = createFramebuffer(gl, width, height);
    const fbB = createFramebuffer(gl, width, height);
    if (!fbA || !fbB) {
      if (gl.isContextLost()) {
        isContextLostRef.current = true;
      } else {
        initFailedRef.current = true;
        console.error("Failed to create WebGL framebuffers");
      }
      disposeGL();
      hasWebglBudgetSlotRef.current = releaseWeatherWebglBudgetSlotOnInitFailure(
        canvas,
        hasWebglBudgetSlotRef.current,
      );
      return false;
    }
    fbRef.current.a = fbA;
    fbRef.current.b = fbB;

    // Load moon texture
    const moonTexture = gl.createTexture();
    if (moonTexture) {
      gl.bindTexture(gl.TEXTURE_2D, moonTexture);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        1,
        1,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([128, 128, 128, 255]),
      );
      moonTextureRef.current = moonTexture;

      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        const glCurrent = glRef.current;
        if (!glCurrent || moonTextureRef.current !== moonTexture) return;

        glCurrent.bindTexture(gl.TEXTURE_2D, moonTexture);
        glCurrent.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          image,
        );
        glCurrent.generateMipmap(gl.TEXTURE_2D);
        glCurrent.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_MIN_FILTER,
          gl.LINEAR_MIPMAP_LINEAR,
        );
        glCurrent.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_MAG_FILTER,
          gl.LINEAR,
        );
        glCurrent.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        glCurrent.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_WRAP_T,
          gl.CLAMP_TO_EDGE,
        );
        moonTextureLoadedRef.current = true;
      };
      image.src = new URL("../assets/moon-texture.jpg", import.meta.url).toString();
    }

    // Setup fullscreen quad
    const positions = new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]);
    const positionBuffer = gl.createBuffer();
    if (!positionBuffer) {
      if (gl.isContextLost()) {
        isContextLostRef.current = true;
      } else {
        initFailedRef.current = true;
        console.error("Failed to create WebGL buffer");
      }
      disposeGL();
      hasWebglBudgetSlotRef.current = releaseWeatherWebglBudgetSlotOnInitFailure(
        canvas,
        hasWebglBudgetSlotRef.current,
      );
      return false;
    }
    positionBufferRef.current = positionBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Setup vertex attributes for all programs
    for (const program of Object.values(programsRef.current)) {
      if (program) {
        const positionLoc = gl.getAttribLocation(program, "a_position");
        if (positionLoc >= 0) {
          gl.enableVertexAttribArray(positionLoc);
          gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
        }
      }
    }

    startTimeRef.current = performance.now();
    return true;
  }, [disposeGL]);

  const render = useCallback(() => {
    const gl = glRef.current;
    const canvas = canvasRef.current;
    const programs = programsRef.current;
    const fb = fbRef.current;
    const props = propsRef.current;

    if (isContextLostRef.current || !isVisibleRef.current) {
      isRunningRef.current = false;
      animationFrameRef.current = 0;
      return;
    }

    if (!gl || !canvas || !fb.a || !fb.b) {
      isRunningRef.current = false;
      return;
    }

    // Resize handling
    const dpr = props.dpr ?? window.devicePixelRatio;
    const displayWidth = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const displayHeight = Math.max(1, Math.floor(canvas.clientHeight * dpr));

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
      resizeFramebuffer(gl, fb.a, displayWidth, displayHeight);
      resizeFramebuffer(gl, fb.b, displayWidth, displayHeight);
    }

    const time = (performance.now() - startTimeRef.current) / 1000;

    const u = (program: WebGLProgram, name: string) =>
      getUniformLocationCached(gl, program, name);

    // Lightning auto-trigger
    if (
      props.layers.lightning &&
      props.lightning.enabled &&
      props.lightning.autoMode
    ) {
      if (time >= nextFlashTimeRef.current) {
        lastFlashTimeRef.current = time;
        strikeSeedRef.current = Math.random();
        nextFlashTimeRef.current =
          time + props.lightning.autoInterval * (0.5 + Math.random());
      }
    }

    // Ping-pong framebuffers
    let readFB = fb.a;
    let writeFB = fb.b;

    const swapBuffers = () => {
      const temp = readFB;
      readFB = writeFB;
      writeFB = temp;
    };

    // === PASS 1: Celestial ===
    if (props.layers.celestial && programs.celestial) {
      renderCelestialPass({
        gl,
        program: programs.celestial,
        target: writeFB,
        displayWidth,
        displayHeight,
        time,
        params: props.celestial,
        moonTexture: moonTextureRef.current,
        moonTextureLoaded: moonTextureLoadedRef.current,
        getUniformLocation: u,
      });
      swapBuffers();
    } else {
      clearOffscreenPass(gl, writeFB, displayWidth, displayHeight);
      swapBuffers();
    }

    // === PASS 2: Clouds ===
    if (props.layers.clouds && programs.cloud) {
      renderCloudPass({
        gl,
        program: programs.cloud,
        target: writeFB,
        sceneTexture: readFB.texture,
        displayWidth,
        displayHeight,
        time,
        params: props.cloud,
        celestial: props.celestial,
        getUniformLocation: u,
      });
      swapBuffers();
    }

    // === PASS 3: Rain ===
    if (props.layers.rain && programs.rain) {
      renderRainPass({
        gl,
        program: programs.rain,
        target: writeFB,
        sceneTexture: readFB.texture,
        displayWidth,
        displayHeight,
        time,
        params: props.rain,
        interactions: props.interactions,
        getUniformLocation: u,
      });
      swapBuffers();
    }

    // === PASS 4: Lightning ===
    const lightningActive = isLightningPassActive(
      props.layers,
      props.lightning,
      programs.lightning,
      time,
      lastFlashTimeRef.current,
    );

    if (lightningActive && programs.lightning) {
      renderLightningPass({
        gl,
        program: programs.lightning,
        target: writeFB,
        sceneTexture: readFB.texture,
        displayWidth,
        displayHeight,
        time,
        params: props.lightning,
        interactions: props.interactions,
        lastFlashTime: lastFlashTimeRef.current,
        strikeSeed: strikeSeedRef.current,
        getUniformLocation: u,
      });
      swapBuffers();
    }

    // === PASS 5: Snow ===
    if (props.layers.snow && programs.snow) {
      renderSnowPass({
        gl,
        program: programs.snow,
        target: writeFB,
        sceneTexture: readFB.texture,
        displayWidth,
        displayHeight,
        time,
        params: props.snow,
        getUniformLocation: u,
      });
      swapBuffers();
    }

    // === Final: Render to screen ===
    if (programs.composite) {
      renderCompositePass({
        gl,
        program: programs.composite,
        sceneTexture: readFB.texture,
        displayWidth,
        displayHeight,
        time,
        celestial: props.celestial,
        interactions: props.interactions,
        post: props.post,
        lastFlashTime: lastFlashTimeRef.current,
        strikeSeed: strikeSeedRef.current,
        getUniformLocation: u,
      });
    }

    if (isVisibleRef.current && !isContextLostRef.current) {
      isRunningRef.current = true;
      animationFrameRef.current = requestAnimationFrame(render);
    } else {
      isRunningRef.current = false;
      animationFrameRef.current = 0;
    }
  }, [getUniformLocationCached]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onContextLost = (e: Event) => {
      e.preventDefault();
      isContextLostRef.current = true;
      disposeGL();
    };

    const onContextRestored = () => {
      isContextLostRef.current = false;
      initFailedRef.current = false;
      if (initGL() && isVisibleRef.current) {
        isRunningRef.current = true;
        render();
      }
    };

    canvas.addEventListener("webglcontextlost", onContextLost, {
      passive: false,
    } as AddEventListenerOptions);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              const entry = entries[0];
              const visible = Boolean(entry?.isIntersecting);
              isVisibleRef.current = visible;

              if (!visible) {
                stopRenderLoop();
                // Release our budget slot while offscreen so other widgets can render.
                // This is especially important in the tuning studio, where many canvases
                // exist but only a subset are visible at once.
                disposeGL();
                if (hasWebglBudgetSlotRef.current) {
                  releaseWeatherWebglCanvasBudgetSlot(canvas);
                }
                hasWebglBudgetSlotRef.current = null;
                return;
              }

              if (!isRunningRef.current && !isContextLostRef.current) {
                // If we have a valid context, resume. Otherwise re-init.
                if (glRef.current && fbRef.current.a && fbRef.current.b) {
                  isRunningRef.current = true;
                  render();
                } else if (initGL()) {
                  isRunningRef.current = true;
                  render();
                }
              }
            },
            { threshold: 0 },
          )
        : null;

    // If IntersectionObserver isn't available, fall back to always-on rendering.
    if (!observer) {
      isVisibleRef.current = true;
    } else {
      observer.observe(canvas);
    }

    if (!observer) {
      if (initGL() && isVisibleRef.current) {
        isRunningRef.current = true;
        render();
      }
    }

    return () => {
      observer?.disconnect();
      canvas.removeEventListener(
        "webglcontextlost",
        onContextLost as EventListener,
      );
      canvas.removeEventListener(
        "webglcontextrestored",
        onContextRestored as EventListener,
      );
      disposeGL();
      if (hasWebglBudgetSlotRef.current) {
        releaseWeatherWebglCanvasBudgetSlot(canvas);
      }
    };
  }, [disposeGL, initGL, render, stopRenderLoop]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
