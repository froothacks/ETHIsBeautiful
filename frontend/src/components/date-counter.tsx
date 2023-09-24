import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { format } from "date-fns";
import { TIME_INTERVAL_MS } from "../utils/constants";

type DateCounterProps = {
  minTimestamp: number;
  maxTimestamp: number;
  didRefresh: boolean;
  setDidRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  className: string;
};

export const DateCounter: React.FC<DateCounterProps> = ({
  minTimestamp,
  maxTimestamp,
  didRefresh,
  setDidRefresh,
  className,
}) => {
  const [currentTimestamp, setCurrentTimestamp] = useState(minTimestamp);

  useEffect(() => {
    if (didRefresh) {
      setDidRefresh(false);
      setCurrentTimestamp(minTimestamp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [didRefresh]);

  useEffect(() => {
    const incrementByDay = 24 * 60 * 60 * 1000; // one day in milliseconds
    const steps = (maxTimestamp - minTimestamp) / incrementByDay;

    // Using setInterval for counting
    const intervalId = setInterval(() => {
      setCurrentTimestamp((prevTimestamp) => {
        if (prevTimestamp >= maxTimestamp) {
          clearInterval(intervalId);
          return prevTimestamp;
        }
        return prevTimestamp + incrementByDay;
      });
    }, TIME_INTERVAL_MS / steps);

    return () => clearInterval(intervalId);
  }, [minTimestamp, maxTimestamp]);

  const date = format(new Date(currentTimestamp), "MMM d, yyyy");

  return (
    // @ts-ignore
    <div
      style={{ width: "140px" }}
      className={clsx(
        "flex justify-center text-md font-medium bg-gray-600 p-4 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5",
        className
      )}
    >
      {date}
    </div>
  );
};
