import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ForceGraph3D } from "react-force-graph";
import GRAPH_DATA_JSON from "./data/etherscan.json";

import { DateCounter } from "./components/date-counter";
// import { TransactionCounter } from "./components/transaction-counter";
import { gray } from "./utils/colors";
import { TGraphData } from "./utils/types";
import { getRandomBaseColor, getTimestampInfo, hashAddressToGroup } from "./utils/helpers";
import { CADENCE_MS, NUM_BUCKETS, TXN_THRESHOLD } from "./utils/constants";

const GRAPH_DATA = GRAPH_DATA_JSON as TGraphData;

function App() {
  const fgRef = useRef();
  const [didRefresh, setDidRefresh] = useState(false);
  const [baseColor, setBaseColor] = useState(getRandomBaseColor());

  const { minTimestamp, maxTimestamp, scalingFactor } = getTimestampInfo(
    GRAPH_DATA.links
  );

  const { buckets } = usePopulateBuckets(
    GRAPH_DATA.links,
    minTimestamp,
    scalingFactor
  );

  console.log({ minTimestamp, maxTimestamp });

  useEffect(() => {
    // Set up the timeouts
    buckets.forEach((bucket, index) => {
      const delay = index * CADENCE_MS;

      setTimeout(() => {
        if (fgRef.current) {
          bucket.forEach((data) => {
            // @ts-ignore
            fgRef.current.emitParticle(data);
          });
        }
      }, delay);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const refresh = useCallback(() => {
    if (fgRef.current) {
      // @ts-ignore
      fgRef.current.refresh();
      setDidRefresh(true);
      setBaseColor(getRandomBaseColor());
    }
  }, [fgRef]);

  return (
    <div className="App">
      <div className="absolute top-10 right-20 z-10">
        <button
          type="button"
          onClick={refresh}
          className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-800 focus-visible:ring-offset-2"
        >
          Refresh
        </button>
      </div>

      <DateCounter
        minTimestamp={minTimestamp * 1000} // timestamps need to be converted to milliseconds
        maxTimestamp={maxTimestamp * 1000}
        didRefresh={didRefresh}
        setDidRefresh={setDidRefresh}
        className="absolute bottom-10 left-20 z-10"
      />

      {/* <TransactionCounter bucketValues={bucketValues} cadence={CADENCE_MS} /> */}

      <ForceGraph3D
        ref={fgRef}
        backgroundColor="#141414"
        graphData={GRAPH_DATA}
        showNavInfo={false}
        /* 
        NODE CONFIGS
         */
        nodeLabel="id"
        onNodeDragEnd={(node) => {
          // fix nodes positions after dragging
          node.fx = node.x;
          node.fy = node.y;
          node.fz = node.z;
        }}
        onNodeClick={focusNode} // camera focus adjustment on zoom
        nodeResolution={32}
        nodeColor={(node) => {
          const group = hashAddressToGroup(node.id);
          const intensity = ["800", "700", "600", "500", "400", "300"][group];
          return baseColor[intensity as never];
        }}
        /* 
        LINK CONFIGS
         */
        linkHoverPrecision={12}
        linkWidth={2}
        linkColor={() => gray["900"]}
        /* 
        LINK PARTICLE CONFIGS
        */
        linkDirectionalParticleWidth={13}
        linkDirectionalParticleColor={() => baseColor["900"]}
        linkDirectionalParticleSpeed={0.012}
      />
    </div>
  );
}

// Function to populate the buckets
const usePopulateBuckets = (
  links: TGraphData["links"],
  minTimestamp: number,
  scalingFactor: number
) => {
  const buckets: TGraphData["links"][] = useMemo(
    () => Array.from({ length: NUM_BUCKETS }, () => []),
    []
  );
  const bucketValues: number[] = useMemo(
    () => Array.from({ length: NUM_BUCKETS }, () => 0),
    []
  );

  links.forEach((link) => {
    link.data.forEach(({ value, timestamp }) => {
      const normalizedTimestamp = Number(timestamp) - minTimestamp;
      const scaledTimestamp = normalizedTimestamp * scalingFactor;
      let bucketIndex = Math.floor(scaledTimestamp / CADENCE_MS);

      // Ensure bucketIndex is within valid bounds
      bucketIndex = Math.min(bucketIndex, NUM_BUCKETS - 1);

      if (buckets[bucketIndex].length < TXN_THRESHOLD) {
        buckets[bucketIndex].push(link);
        bucketValues[bucketIndex] += Number(value);
      }
    });
  });

  return { buckets, bucketValues };
};

export default App;
