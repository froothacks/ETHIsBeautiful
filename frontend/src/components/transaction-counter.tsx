import React, { useEffect, useState } from "react";

type TransactionCounterProps = {
  curETHValue: number;
  bucketValues: number[];
  cadence: number;
};

export const TransactionCounter: React.FC<TransactionCounterProps> = ({
  curETHValue,
  bucketValues,
  cadence,
}) => {
  const [currentTransaction, setCurrentTransaction] = useState(0);
  const [nextTransaction, setNextTransaction] = useState(0);

  useEffect(() => {
    let currentIndex = 0;
    const intervalId = setInterval(() => {
      currentIndex++;
      while (
        bucketValues[currentIndex] === 0 &&
        currentIndex < bucketValues.length
      ) {
        currentIndex++;
      }

      if (currentIndex >= bucketValues.length) {
        clearInterval(intervalId);
      } else {
        setNextTransaction(bucketValues[currentIndex]);
      }
    }, cadence);

    return () => clearInterval(intervalId);
  }, [cadence]);

  useEffect(() => {
    const delta = (nextTransaction - currentTransaction) / (cadence / 10);
    const intervalId = setInterval(() => {
      if (Math.abs(nextTransaction - currentTransaction) < Math.abs(delta)) {
        setCurrentTransaction(nextTransaction);
        clearInterval(intervalId);
      } else {
        setCurrentTransaction((prev) => prev + delta);
      }
    }, 10);

    return () => clearInterval(intervalId);
  }, [nextTransaction, cadence]);

  return (
    <div className="Transaction">
      {`Total Transaction Value: ${curETHValue} ETH`}
    </div>
  );
};

const formatLargeNumber = (num: number) => {
  const suffixes = ["K", "M", "B", "T", "P", "E"];
  let value = num;

  if (num >= 1000) {
    const exp = Math.floor(Math.log(num) / Math.log(1000));
    value = num / Math.pow(1000, exp);
    const suffix = suffixes[exp - 1];
    return value.toFixed(2) + " " + suffix;
  } else {
    return num.toString();
  }
};
