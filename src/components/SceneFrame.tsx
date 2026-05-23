import type { ReactNode } from "react";
import { Particles } from "./art";

interface SceneFrameProps {
  children: ReactNode;
  height?: number;
}

export function SceneFrame({ children, height = 240 }: SceneFrameProps) {
  return (
    <div style={{
      position:"relative", width:"100%", height,
      overflow: "hidden",
      background: "#0a0604",
    }}>
      {children}
      <div className="grain"/>
      <div className="vignette"/>
      <Particles count={10}/>
      <div style={{
        position:"absolute", left:0, right:0, bottom:0, height: 60,
        background: "linear-gradient(180deg, transparent, rgba(10,6,4,0.95))",
        pointerEvents:"none",
      }}/>
    </div>
  );
}
