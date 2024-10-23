"use client";
import React from "react";

export const PerspectiveGrid = () => {
  return (
    <div className="absolute inset-0 w-full h-full">
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ perspective: "1000px" }}
      >
        <div
          className="absolute inset-0"
          style={{ transform: "rotateX(45deg) translateY(-25%)" }}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)",
              backgroundSize: "100px 50px",
              width: "400vw",
              height: "600vh",
              left: "-150%",
              top: "-150%",
              animation: "moveGrid 20s linear infinite",
            }}
          ></div>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-white/50"></div>
      <style jsx>{`
        @keyframes moveGrid {
          0% {
            transform: translateY(0%);
          }
          100% {
            transform: translateY(16.67%);
          }
        }
      `}</style>
    </div>
  );
};
