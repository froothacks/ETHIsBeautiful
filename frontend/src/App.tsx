import React, { useCallback, useEffect, useRef } from "react";
import { ForceGraph3D } from "react-force-graph";
import GraphData from "./data/etherscan.json";
// import GraphData from "./data/etherscan.json";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import * as THREE from "three";

function App() {
  const fgRef = useRef();

  useEffect(() => {
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.3,
      0.3,
      1.2
    );
    // @ts-ignore
    fgRef.current.postProcessingComposer().addPass(bloomPass);
  }, []);

  const focusNode = useCallback(
    (node: any) => {
      // Aim at node from outside it
      const distance = 40;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

    // @ts-ignore
      fgRef.current.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
        node, // lookAt ({ x, y, z })
        3000 // ms transition duration
      );
    },
    [fgRef]
  );
  return (
    <div className="App">
      <ForceGraph3D
        ref={fgRef}
        backgroundColor="#141414"
        graphData={GraphData}
        nodeLabel="id"
        nodeAutoColorBy="user"
        showNavInfo={false}
        // fix nodes positions after dragging
        onNodeDragEnd={(node) => {
          node.fx = node.x;
          node.fy = node.y;
          node.fz = node.z;
        }}
        // camera focus adjustment on zoom
        onNodeClick={focusNode}
      />{" "}
    </div>
  );
}

export default App;
