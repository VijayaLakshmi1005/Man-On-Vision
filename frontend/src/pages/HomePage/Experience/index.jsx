import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll } from '@react-three/drei';
import SceneWorld from './SceneWorld';
import CameraRig from './CameraRig';
import ScrollManager from './ScrollManager';
import Sections from './Sections';
import GSAPController from './GSAPController';

const Experience = () => {
    return (
        <div className="w-full h-full">
            <Canvas
                shadows
                camera={{ position: [0, 0, 10], fov: 35 }}
                gl={{ antialias: true, alpha: true }}
            >
                <color attach="background" args={['#0c0a09']} />
                <Suspense fallback={null}>
                    <ScrollControls pages={5} damping={0.2}>
                        <GSAPController />
                        <CameraRig />
                        <ScrollManager />

                        <SceneWorld />

                        <Scroll html>
                            <Sections />
                        </Scroll>
                    </ScrollControls>
                </Suspense>
            </Canvas>
        </div>
    );
};

export default Experience;
