import React, { useCallback, useEffect, useRef, useState } from "react";
import { ForceGraph3D } from "react-force-graph";
// import GRAPH_DATA from "./data/blocks.json";
import GRAPH_DATA_JSON from "./data/etherscan.json";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import * as THREE from "three";

// Global constants
const TIME_INTERVAL_MS = 180000; // 3 minutes in milliseconds
// const CADENCE_MS = 250; // 1/4 of a second in milliseconds
const SECONDS_IN_A_DAY = 24 * 60 * 60; // 86400 seconds

// const minTimestamp = Math.min(...allTimestamps); // assume these are in seconds
// const maxTimestamp = Math.max(...allTimestamps);

// // Calculate the number of days between minTimestamp and maxTimestamp
// const numDays = (maxTimestamp - minTimestamp) / SECONDS_IN_A_DAY;

// If you want to consider partial days as separate buckets, 
// you might want to use Math.ceil to round up to the nearest whole number.
// const NUM_BUCKETS = Math.ceil(numDays);

// const NUM_BUCKETS = TIME_INTERVAL_MS / CADENCE_MS;
const TXN_THRESHOLD = 3;

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

  const [curETHValue, setCurETHValue] = useState(0);
  const [curDatetime, setCurDatetime] = useState(new Date());

  useEffect(() => {
    const { minTimestamp, maxTimestamp, scalingFactor } = getTimestampInfo(GRAPH_DATA.links);
    // Calculate the number of days between minTimestamp and maxTimestamp
    const numDays = (maxTimestamp - minTimestamp) / SECONDS_IN_A_DAY;


    const NUM_BUCKETS = Math.ceil(numDays / 4);
    console.log("NUM BUCKETTTTSS", NUM_BUCKETS);
    const CADENCE_MS = TIME_INTERVAL_MS / NUM_BUCKETS;

    const buckets = populateBuckets(
      GRAPH_DATA.links,
      minTimestamp,
      maxTimestamp,
      scalingFactor,
      NUM_BUCKETS,
      CADENCE_MS,
    );

    // Set up the timeouts
    buckets.forEach((bucket, index) => {
      // if (bucket.length > 50) {
      //   console.info(`bucket${index} has ${bucket.length} transactions`);
      // }
      const delay = index * CADENCE_MS;


      const elapsedTime = index * CADENCE_MS * (1 / scalingFactor);
      const realTime = minTimestamp + elapsedTime;
      // console.log("SCALING FACtor", scalingFactor);
      // console.log("elapsed time", index, elapsedTime);
      // console.log("real time", realTime);

      const aggregateValue = bucket.reduce((sum, linksObject) => {
        const linksData = linksObject.data.reduce((linksSum, dataItem) => {
          return linksSum + Number(dataItem.value);
        }, 0);
        return sum + linksData;
      }, 0);

      // console.log(aggregateValue);

      // console.log("aggVal", aggregateValue);


      // console.log("REAL TIME NOW", realTime);
      console.log(index)
      let curDate = new Date(realTime * 1000);
      // curDate.setUTCSeconds(aggregateValue);
      
      setTimeout(() => {
        if (fgRef.current) {
          bucket.forEach((data) => {
            // @ts-ignore
            fgRef.current.emitParticle(data);


          });

          console.log("Eth value now", aggregateValue);
          console.log(curDate);
          setCurETHValue(aggregateValue);
          setCurDatetime(curDate);
        }
      }, delay);
    });
  }, []);

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

  const formattedDate = curDatetime.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="App">
      <p>Current Date: {formattedDate}</p>
      <p>ETH sent today: {curETHValue}</p>
      <ForceGraph3D
        ref={fgRef}
        backgroundColor="#141414"
        graphData={GRAPH_DATA}
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
        linkHoverPrecision={10}
        linkDirectionalParticleWidth={25}
        linkDirectionalParticleColor={() => "red"}
        linkDirectionalParticleSpeed={0.2}
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
const populateBuckets = (
  links: TGraphData["links"],
  minTimestamp: number,
  maxTimestamp: number,
  scalingFactor: number,
  NUM_BUCKETS: number,
  CADENCE_MS: number,
) => {
//   const minTimestamp = Math.min(...allTimestamps); // assume these are in seconds
// const maxTimestamp = Math.max(...allTimestamps);


  const buckets: TGraphData["links"][] = Array.from(
    { length: NUM_BUCKETS },
    () => []
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
      } else {
        // if (buckets[bucketIndex].length === TXN_THRESHOLD) {
        //   console.info(`Bucket ${bucketIndex} is full`);
        // }
      }
    });
  });

  return buckets;
};

export default App;
