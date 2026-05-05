import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const TopographicMesh = () => {
    const meshRef = useRef();

    const shaderArgs = useMemo(() => ({
        uniforms: {
            uTime: { value: 0 },
            uColor1: { value: new THREE.Color('#f97316') },
            uColor2: { value: new THREE.Color('#1c1917') },
        },
        vertexShader: `
            varying vec2 vUv;
            varying float vElevation;
            uniform float uTime;

            // Simple noise function
            float noise(vec2 p) {
                return sin(p.x * 2.0 + uTime * 0.5) * cos(p.y * 2.0 + uTime * 0.5);
            }

            void main() {
                vUv = uv;
                vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                
                float elevation = sin(modelPosition.x * 0.5 + uTime * 0.2) * 
                                  cos(modelPosition.z * 0.5 + uTime * 0.2) * 0.5;
                
                modelPosition.y += elevation;
                vElevation = elevation;

                gl_Position = projectionMatrix * viewMatrix * modelPosition;
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            varying float vElevation;
            uniform vec3 uColor1;
            uniform vec3 uColor2;

            void main() {
                float mixStrength = (vElevation + 0.5) * 0.8;
                vec3 color = mix(uColor2, uColor1, mixStrength);
                
                // Add some topographic lines
                float line = step(0.9, fract(vElevation * 10.0));
                color = mix(color, vec3(1.0), line * 0.2);

                gl_FragColor = vec4(color, 1.0);
            }
        `
    }), []);

    useFrame((state) => {
        meshRef.current.material.uniforms.uTime.value = state.clock.getElapsedTime();
    });

    return (
        <mesh
            ref={meshRef}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -5, 0]}
            receiveShadow
        >
            <planeGeometry args={[50, 50, 128, 128]} />
            <shaderMaterial
                args={[shaderArgs]}
                side={THREE.DoubleSide}
                wireframe={false}
            />
        </mesh>
    );
};

export default TopographicMesh;
