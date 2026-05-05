import React, { useEffect, useRef } from 'react';

const LiquidMazeStatic = ({ 
    color1 = "#ff5a96", 
    color2 = "#ffb040", 
    bgColor = "#0c0a09", 
    opacity = 1.0,
    speed = 0.005,
    density = 0.2
}) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl', { antialias: true, alpha: true });
        if (!gl) return;

        const hexToRgb = (hex) => {
            const r = parseInt(hex.slice(1, 3), 16) / 255;
            const g = parseInt(hex.slice(3, 5), 16) / 255;
            const b = parseInt(hex.slice(5, 7), 16) / 255;
            return `vec3(${r.toFixed(3)}, ${g.toFixed(3)}, ${b.toFixed(3)})`;
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
            uniform float u_twirl;
            uniform float u_scroll;

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

                // --- CONTINUOUS SCROLL FLOW ---
                vec2 noiseP = p;
                noiseP.y += u_scroll * 5.0;
                noiseP.x += sin(u_scroll * 3.14159) * 0.2;

                float slowTime = u_time * ${speed.toFixed(6)};
                
                float n = snoise(noiseP * ${density.toFixed(2)} + slowTime);
                n += 0.3 * snoise(noiseP * ${(density * 1.5).toFixed(2)} - slowTime * 1.2);
                
                float pattern = sin(n * 4.0 + u_time * 0.005); 
                
                float threshold = 0.12; 
                float edge = 0.01;      
                float mask = smoothstep(threshold - edge, threshold + edge, abs(pattern));
                
                vec3 c1 = ${hexToRgb(color1)};
                vec3 c2 = ${hexToRgb(color2)};
                vec3 bg = ${hexToRgb(bgColor)};
                
                vec3 lineColor = mix(c1, c2, uv.x);
                vec3 finalColor = mix(lineColor, bg, mask);

                gl_FragColor = vec4(finalColor, ${opacity.toFixed(2)});
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
        const twirlLoc = gl.getUniformLocation(program, 'u_twirl');
        const scrollLoc = gl.getUniformLocation(program, 'u_scroll');

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = canvas.clientWidth * dpr;
            canvas.height = canvas.clientHeight * dpr;
            gl.viewport(0, 0, canvas.width, canvas.height);
        };

        window.addEventListener('resize', resize);
        resize();

        let animationFrameId;
        const render = (time) => {
            const twirl = window.heroTwirl || 0;
            const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
            const scroll = scrollTotal > 0 ? window.scrollY / scrollTotal : 0;
            
            gl.useProgram(program);
            gl.uniform1f(timeLoc, time * 0.001);
            gl.uniform2f(resLoc, canvas.width, canvas.height);
            gl.uniform1f(twirlLoc, twirl);
            gl.uniform1f(scrollLoc, scroll);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
            animationFrameId = requestAnimationFrame(render);
        };
        animationFrameId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [color1, color2, bgColor, opacity, speed, density]);

    return (
        <canvas
            ref={canvasRef}
            className="w-full h-full block"
            style={{ position: 'absolute', top: 0, left: 0, zIndex: -1 }}
        />
    );
};

export default LiquidMazeStatic;
