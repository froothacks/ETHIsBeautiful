import React from "react";
import { ForceGraph3D } from "react-force-graph";
import GraphData from "./data/blocks.json";

function App() {
  return (
    <div className="App">
      <ForceGraph3D
        graphData={GraphData}
        nodeLabel={(node: any) => `${node.user}: ${node.description}`}
        nodeAutoColorBy={"user"}
      />
    </div>
  );
}

export default App;
