import type { CSSProperties, ReactNode } from "react";

interface SealTagProps {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  style?: CSSProperties;
}

export function SealTag({ children, size = "md", style }: SealTagProps) {
  const cls = size === "lg" ? "seal seal-lg" : size === "sm" ? "seal seal-sm" : "seal";
  return <div className={cls} style={style}>{children}</div>;
}
