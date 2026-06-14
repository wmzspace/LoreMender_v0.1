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
      background: "#06090b",
    }}>
      {children}
      <div className="grain"/>
      <div className="vignette"/>
      <Particles count={10}/>
      <div style={{
        position:"absolute", left:0, right:0, bottom:0, height: 60,
        background: "linear-gradient(180deg, transparent, rgba(7,11,14,0.95))",
        pointerEvents:"none",
      }}/>
    </div>
  );
}
