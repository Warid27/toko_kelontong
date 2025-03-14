import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";

const Model = () => {
  const { scene } = useGLTF("/Object/Tokel3D.glb");
  const modelRef = useRef();

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.01; // Continuous rotation on X-axis
    }
  });

  return <primitive ref={modelRef} object={scene} scale={2} />;
};

const ThreeDModel = () => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 2, 2]} />
        <Suspense fallback={null}>
          <Model />
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default ThreeDModel;
