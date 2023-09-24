import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ForceGraph3D } from "react-force-graph";
import GRAPH_DATA_JSON from "./data/etherscan.json";
import { useUnrealBloomEffect } from "./hooks";
import Button from "./components/button";
import { DateCounter } from "./components/date-counter";
import { TransactionCounter } from "./components/transaction-counter";

// Global constants
export const TIME_INTERVAL_MS = 180000; // 3 minutes in milliseconds
const CADENCE_MS = 250; // 1/4 of a second in milliseconds
const NUM_BUCKETS = TIME_INTERVAL_MS / CADENCE_MS;
const TXN_THRESHOLD = 20;

type TGraphData = {
  nodes: {
    id: string;
    user: string;
  }[];
  links: {
    source: string;
    target: string;
    data: { value: string; timestamp: string }[];
  }[];
};

const GRAPH_DATA = GRAPH_DATA_JSON as TGraphData;

function App() {
  const fgRef = useRef();
  const [didRefresh, setDidRefresh] = useState(false);

  const { minTimestamp, maxTimestamp, scalingFactor } = getTimestampInfo(
    GRAPH_DATA.links
  );

  const { buckets, bucketValues } = usePopulateBuckets(
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
  }, []);

  useUnrealBloomEffect(fgRef);

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
    }
  }, [fgRef]);

  return (
    <div className="App">
      <div className="absolute top-10 right-20 z-10">
        <button
          type="button"
          onClick={refresh}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
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

      <TransactionCounter bucketValues={bucketValues} cadence={CADENCE_MS} />

      <ForceGraph3D
        ref={fgRef}
        backgroundColor="#141414"
        graphData={GRAPH_DATA}
        nodeLabel="id"
        nodeAutoColorBy="user"
        showNavInfo={false}
        onNodeDragEnd={(node) => {
          // fix nodes positions after dragging
          node.fx = node.x;
          node.fy = node.y;
          node.fz = node.z;
        }}
        onNodeClick={focusNode} // camera focus adjustment on zoom
        linkHoverPrecision={10}
        linkDirectionalParticleWidth={23}
        linkDirectionalParticleColor={() => "red"}
        // linkDirectionalParticleSpeed={0.2}
      />
    </div>
  );
}

// Function to find min/max timestamps and scaling factor
const getTimestampInfo = (links: TGraphData["links"]) => {
  const allTimestamps = links.flatMap((link) =>
    link.data.map((item) => Number(item.timestamp))
  );
  const minTimestamp = Math.min(...allTimestamps);
  const maxTimestamp = Math.max(...allTimestamps);

  const scalingFactor = TIME_INTERVAL_MS / (maxTimestamp - minTimestamp);

  console.log("minTimestamp", minTimestamp);
  console.log("maxTimestamp", maxTimestamp);

  return { minTimestamp, maxTimestamp, scalingFactor };
};

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
        console.log({ value });
        bucketValues[bucketIndex] += Number(value);
      }
    });
  });

  return { buckets, bucketValues };
};

export default App;
