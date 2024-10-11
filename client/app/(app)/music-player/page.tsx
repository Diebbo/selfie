"use client";
import React from "react";
import MusicPlayer from "@/components/music-player/MusicPlayer";

const MusicPlayerPage: React.FC = () => {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(90deg, rgba(87,97,187,1) 0%, rgba(141,165,255,1) 51%, rgba(255,0,230,1) 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          zIndex: 1,
        }}
      ></div>
      <div style={{ position: "relative", zIndex: 2, display: "flex"}}>
        <MusicPlayer />
      </div>
    </div>
  );
};

export default MusicPlayerPage;