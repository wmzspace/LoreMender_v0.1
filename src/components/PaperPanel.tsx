import type { CSSProperties, ReactNode } from "react";

interface PaperPanelProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function PaperPanel({ children, style, className = "" }: PaperPanelProps) {
  return (
    <div className={"paper-panel " + className}
         style={{padding: "16px 18px", ...style}}>
      {children}
    </div>
  );
}
