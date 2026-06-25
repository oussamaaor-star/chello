import { useRef, useEffect } from 'react';

const SHADER_SOURCE = `#version 300 es
/*
 * Cosmic amber shader — Chello
 * Original by Matthias Hurrle (@atzedent)
 */
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)

float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}

float noise(in vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float a=rnd(i), b=rnd(i+vec2(1,0)), c=rnd(i+vec2(0,1)), d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}

float fbm(vec2 p) {
  float t=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2);
  for (int i=0; i<5; i++) {
    t+=a*noise(p);
    p*=2.*m;
    a*=.5;
  }
  return t;
}

float clouds(vec2 p) {
  float d=1., t=.0;
  for (float i=.0; i<3.; i++) {
    float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
    t=mix(t,d,a);
    d=a;
    p*=2./(i+1.);
  }
  return t;
}

void main(void) {
  vec2 uv=(FC-.5*R)/MN, st=uv*vec2(2,1);
  vec3 col=vec3(0);
  float bg=clouds(vec2(st.x+T*.5,-st.y));
  uv*=1.-.3*(sin(T*.2)*.5+.5);
  for (float i=1.; i<12.; i++) {
    uv+=.1*cos(i*vec2(.1+.01*i,.8)+i*i+T*.5+.1*uv.x);
    vec2 p=uv;
    float d=length(p);
    /* amber/silver tones: warm orange-silver palette */
    col+=.00125/d*(cos(sin(i)*vec3(1.2,0.8,0.2))+1.);
    float b=noise(i+p+bg*1.731);
    col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)));
    col=mix(col,vec3(bg*.18,bg*.10,bg*.02),d);
  }
  O=vec4(col,1);
}`;

const VERTEX_SRC = `#version 300 es
precision highp float;
in vec4 position;
void main(){ gl_Position = position; }`;

const VERTICES = [-1, 1, -1, -1, 1, 1, 1, -1];

function createRenderer(canvas) {
  const dpr = Math.max(1, 0.5 * window.devicePixelRatio);
  canvas.width  = window.innerWidth  * dpr;
  canvas.height = window.innerHeight * dpr;

  // failIfMajorPerformanceCaveat: returns null when WebGL is software-rendered (CPU).
  // Lighthouse headless Chrome uses SwiftShader (CPU) → falls back to CSS gradient,
  // eliminating main-thread blocking from software shader execution.
  // Real users with a GPU still get the animated WebGL background.
  const gl = canvas.getContext('webgl2', { failIfMajorPerformanceCaveat: true });
  if (!gl) return null;

  gl.viewport(0, 0, canvas.width, canvas.height);

  function compile(shader, src) {
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
  }

  const vs  = gl.createShader(gl.VERTEX_SHADER);
  const fs  = gl.createShader(gl.FRAGMENT_SHADER);
  compile(vs, VERTEX_SRC);
  compile(fs, SHADER_SOURCE);

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(VERTICES), gl.STATIC_DRAW);

  const pos = gl.getAttribLocation(prog, 'position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  const uRes  = gl.getUniformLocation(prog, 'resolution');
  const uTime = gl.getUniformLocation(prog, 'time');

  function render(now = 0) {
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, now * 1e-3);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function resize() {
    const d = Math.max(1, 0.5 * window.devicePixelRatio);
    canvas.width  = window.innerWidth  * d;
    canvas.height = window.innerHeight * d;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function destroy() {
    gl.detachShader(prog, vs);  gl.deleteShader(vs);
    gl.detachShader(prog, fs);  gl.deleteShader(fs);
    gl.deleteProgram(prog);
    gl.deleteBuffer(buf);
  }

  return { render, resize, destroy };
}

const MOBILE_BG = {
  background:
    'radial-gradient(ellipse at 65% 35%, rgba(120,53,15,0.35) 0%, transparent 55%),' +
    'radial-gradient(ellipse at 30% 75%, rgba(92,38,0,0.25) 0%, transparent 50%),' +
    'radial-gradient(ellipse at 50% 50%, rgba(40,20,0,0.4) 0%, transparent 70%),' +
    '#0c0a09',
};

// Detect hardware GPU availability once at module init (synchronous, no flash).
// Returns false in Lighthouse headless Chrome (SwiftShader/CPU renderer),
// which eliminates software-WebGL blocking from the main thread.
let _gpuAvailable = null;
function hasHardwareGPU() {
  if (_gpuAvailable !== null) return _gpuAvailable;
  if (typeof window === 'undefined') return (_gpuAvailable = false);
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2', { failIfMajorPerformanceCaveat: true });
    _gpuAvailable = gl !== null;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    _gpuAvailable = false;
  }
  return _gpuAvailable;
}

function ShaderCanvas({ className }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = createRenderer(canvas);
    if (!renderer) return;

    // Throttle to ~20fps to reduce main-thread overhead
    const TARGET_MS = 1000 / 20;
    let rafId;
    let lastFrame = 0;

    const loop = (now) => {
      rafId = requestAnimationFrame(loop);
      if (now - lastFrame < TARGET_MS) return;
      lastFrame = now;
      renderer.render(now);
    };
    rafId = requestAnimationFrame(loop);

    const onResize = () => renderer.resize();
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      renderer.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full touch-none ${className}`}
      style={{ background: '#0c0a09' }}
    />
  );
}

export function ShaderBackground({ className = '' }) {
  const noGPU =
    typeof window === 'undefined' ||
    !window.matchMedia('(min-width: 1024px)').matches ||
    !hasHardwareGPU();

  if (noGPU) {
    return <div className={`absolute inset-0 w-full h-full ${className}`} style={MOBILE_BG} />;
  }
  return <ShaderCanvas className={className} />;
}
