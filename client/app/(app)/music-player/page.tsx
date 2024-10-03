"use client";
import React from "react";
import { Card, Button, Slider, Image, CardBody } from "@nextui-org/react";
import MusicPlayer from "@/components/music-player/MusicPlayer";

const Page: React.FC = () => {
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
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1,
        }}
      ></div>
      <div style={{ position: "relative", zIndex: 2 }}>
        <MusicPlayer />
      </div>
    </div>
  );
};

export default Page;
