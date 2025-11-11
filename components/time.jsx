"use client";
import { useState, useEffect, useRef } from "react";

export default function Time() {
  const [time, setTime] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
  };

  const breakTimer = () => {
    if (isRunning) {
      clearInterval(intervalRef.current);
      setIsRunning(false);
      setTime(0); // reset for break
    }
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
  };

  const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className=" flex flex-col items-center justify-center  font-sans p-20 m-10">
      <h1 className="text-4xl font-bold mb-8 text-purple-700">Timer </h1>
      <div className="text-6xl font-mono mb-8 text-purple-900">{formatTime(time)}</div>
      <div className="flex gap-4">
        <button
          onClick={startTimer}
          className="px-6 py-3 bg-green-400 text-white rounded-full hover:bg-green-500 transition"
        >
          Start
        </button>
        <button
          onClick={breakTimer}
          className="px-6 py-3 bg-yellow-400 text-white rounded-full hover:bg-yellow-500 transition"
        >
          Break
        </button>
        <button
          onClick={stopTimer}
          className="px-6 py-3 bg-red-400 text-white rounded-full hover:bg-red-500 transition"
        >
          Stop
        </button>
      </div>
    </div>
  );
}
