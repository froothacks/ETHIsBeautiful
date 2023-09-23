import React, { useEffect, useRef } from "react";
import { ForceGraph3D } from "react-force-graph";
import GraphData from "./data/etherscan.json";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import * as THREE from "three";

function App() {
  const fgRef = useRef();

  useEffect(() => {
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.4,
      0.5,
      0.7
    );
    // @ts-ignore
    fgRef.current.postProcessingComposer().addPass(bloomPass);
  }, []);
  return (
    <div className="App">
      <ForceGraph3D
        ref={fgRef}
        backgroundColor="#000003"
        graphData={GraphData}
        nodeLabel="id"
        nodeAutoColorBy="user"
      />{" "}
    </div>
  );
}

export default App;
