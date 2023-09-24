import { useEffect } from "react";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import * as THREE from "three";

export const useUnrealBloomEffect = (fgRef: React.MutableRefObject<undefined>) => {
    // Apply UnrealBloomPass postprocessing effect
    useEffect(() => {
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.3,
            0.3,
            1.2
        );
        // @ts-ignore
        fgRef.current.postProcessingComposer().addPass(bloomPass);
    }, [fgRef]);
}