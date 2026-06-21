import { useEffect, useState } from "react";

/** 循环显示 1→2→3 个点的加载省略号(不用 CSS 关键帧凑百分比,直接拿 React 状态控制,时序明确)。 */
export function LoadingDots() {
  const [n, setN] = useState(1);
  useEffect(() => {
    const t = window.setInterval(() => setN(v => (v % 3) + 1), 450);
    return () => window.clearInterval(t);
  }, []);
  return <span className="loading-dots">{".".repeat(n)}</span>;
}
