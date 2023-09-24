import { TIME_INTERVAL_MS } from "./constants";
import { TGraphData } from "./types";
import { blue, green, orange, purple, red, teal, yellow } from "./colors";

// Function to find min/max timestamps and scaling factor
export const getTimestampInfo = (links: TGraphData["links"]) => {
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

export const hashAddressToGroup = (address: string) => {
  const hexChars = "0123456789abcdef";
  let sum = 0;

  for (const char of address) {
    sum += hexChars.indexOf(char.toLowerCase());
  }

  return sum % 6; // Create 6 groups
}

export const getRandomBaseColor = () => {
  const colors = [red, blue, green, yellow, purple, teal, orange];
  return colors[Math.floor(Math.random() * colors.length)];
}