import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { format, addDays } from "date-fns";
import { TIME_INTERVAL_MS } from "../App";

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

  const date = new Date(currentTimestamp);
  const month = format(date, "MMMM");
  const day = format(date, "d");
  const year = format(date, "yyyy");

  return (
    // @ts-ignore
    <div
      style={{ width: "150px" }}
      className={clsx("flex justify-between text-md font-medium", className)}
    >
      <div style={{ flexBasis: "50%" }}>{month}</div>
      <div style={{ flexBasis: "20%" }}>{day}</div>
      <div style={{ flexBasis: "30%" }}>{year}</div>
    </div>
  );
};
