import React, { useRef, useEffect } from 'react';

/**
 * WaveBackground - Sharp Minimalist Liquid Maze
 * High-performance WebGL implementation.
 * Features ultra-thin, crisp lines for a sharp and modern aesthetic.
 * Supports a dynamic 'twirl' uniform for hypnotic transitions.
 */
import { useTheme } from '../../context/ThemeContext';

const WaveBackground = () => {
    const canvasRef = useRef(null);
    const { isDarkMode } = useTheme();
    const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
    const twirlRef = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl', { antialias: true, alpha: true });
        if (!gl) return;

        const updateCoords = (x, y) => {
            mouseRef.current.targetX = (x / window.innerWidth) * 2 - 1;
            mouseRef.current.targetY = -((y / window.innerHeight) * 2 - 1);
        };

        const handleMouseMove = (e) => updateCoords(e.clientX, e.clientY);
        const handleTouchMove = (e) => {
            if (e.touches[0]) updateCoords(e.touches[0].clientX, e.touches[0].clientY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove, { passive: true });

        // Update twirl from a global window property (set by GSAP)
        const updateTwirl = () => {
            twirlRef.current = window.heroTwirl || 0;
        };

        const vsSource = `
            attribute vec4 a_position;
            void main() {
                gl_Position = a_position;
            }
        `;

        const fsSource = `
            precision highp float;
            uniform float u_time;
            uniform vec2 u_resolution;
            uniform vec2 u_mouse;
            uniform float u_twirl;

            vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

            float snoise(vec2 v){
                const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy) );
                vec2 x0 = v -   i + dot(i, C.xx);
                vec2 i1;
                i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod(i, 289.0);
                vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                + i.x + vec3(0.0, i1.x, 1.0 ));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                    dot(x12.zw,x12.zw)), 0.0);
                m = m*m ;
                m = m*m ;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                vec3 g;
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                float aspect = u_resolution.x / u_resolution.y;
                
                vec2 p = (uv * 2.0) - 1.0;
                p.x *= aspect;
                
                // --- HYPNOTIC TWIRL ---
                float angle = u_twirl * exp(-length(p) * 1.5);
                float s = sin(angle);
                float c = cos(angle);
                p = vec2(p.x * c - p.y * s, p.x * s + p.y * c);

                vec2 m = u_mouse;
                m.x *= aspect;
                
                float dist = length(p - m);
                float strength = 0.22; 
                float radius = 0.6;
                vec2 distortion = normalize(p - m) * strength * exp(-dist / radius);
                vec2 noiseP = p + distortion;
                
                float slowTime = u_time * 0.025; 
                float n = snoise(noiseP * 0.8 + slowTime * 0.2);
                n += 0.35 * snoise(noiseP * 1.6 - slowTime * 0.4);
                
                float pattern = sin(n * 9.0 + u_time * 0.1); 
                
                float threshold = 0.28; 
                float edge = 0.08; 
                float mask = smoothstep(threshold - edge, threshold + edge, abs(pattern));
                
                float centerDist = length(p);
                float centralMask = smoothstep(0.4, 2.0, centerDist);
                mask = mix(1.0, mask, centralMask);
                
                vec3 colorPink = vec3(1.0, 0.3, 0.55);   
                vec3 colorOrange = vec3(1.0, 0.7, 0.3);   
                vec3 lineColor = mix(colorPink, colorOrange, uv.x * 0.8 + uv.y * 0.4);
                vec3 colorPinkSubtle = vec3(1.0, 0.94, 0.95);
                vec3 colorOrangeSubtle = vec3(1.0, 0.97, 0.92);
                vec3 bgColor = ${isDarkMode ? 'vec3(0.04, 0.04, 0.04)' : 'mix(colorPinkSubtle, colorOrangeSubtle, uv.x * 0.6 + uv.y * 0.4)'};
                
                vec3 finalColor = mix(lineColor, bgColor, mask);
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;

        const createShader = (gl, type, source) => {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            return shader;
        };

        const program = gl.createProgram();
        gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vsSource));
        gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fsSource));
        gl.linkProgram(program);
        gl.useProgram(program);

        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
        const posLoc = gl.getAttribLocation(program, 'a_position');
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        const timeLoc = gl.getUniformLocation(program, 'u_time');
        const resLoc = gl.getUniformLocation(program, 'u_resolution');
        const mouseLoc = gl.getUniformLocation(program, 'u_mouse');
        const twirlLoc = gl.getUniformLocation(program, 'u_twirl');

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = canvas.clientWidth * dpr;
            canvas.height = canvas.clientHeight * dpr;
            gl.viewport(0, 0, canvas.width, canvas.height);
        };

        window.addEventListener('resize', resize);
        resize();

        let animationFrameId;
        const currentMouse = { x: 0, y: 0 };

        const render = (time) => {
            updateTwirl();
            currentMouse.x += (mouseRef.current.targetX - currentMouse.x) * 0.06;
            currentMouse.y += (mouseRef.current.targetY - currentMouse.y) * 0.06;

            gl.uniform1f(timeLoc, time * 0.001);
            gl.uniform2f(resLoc, canvas.width, canvas.height);
            gl.uniform2f(mouseLoc, currentMouse.x, currentMouse.y);
            gl.uniform1f(twirlLoc, twirlRef.current);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            animationFrameId = requestAnimationFrame(render);
        };
        animationFrameId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isDarkMode]);

    return (
        <canvas
            ref={canvasRef}
            id="hero-canvas"
            className="absolute inset-0 z-0 block pointer-events-none w-full h-full"
        />
    );
};

export default WaveBackground;
