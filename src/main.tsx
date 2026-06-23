import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import "./lib/quality"; // 副作用：尽早把 data-quality 写到 <html>，让画质相关 CSS 首帧即生效
import App from "./App";

const EditorApp = lazy(() => import("./editor/EditorApp"));

const isEditor = window.location.pathname.startsWith("/editor");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isEditor ? (
      <Suspense fallback={<div style={{color:"#ebd9b3",display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"#05080a"}}>加载编辑器...</div>}>
        <EditorApp />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);

// index.html 里的内联加载屏("典故记载中")在 React 挂载前就已经绘制,这里等 React 首帧画完
// (双 rAF 确保 BootScreen 已经在底下绘制好)再把它淡出移除,实现无缝接管,不出现黑屏闪烁。
const splash = document.getElementById("boot-splash");
if (splash) {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    splash.classList.add("is-out");
    splash.addEventListener("transitionend", () => splash.remove(), { once: true });
    // 兜底:transitionend 万一没触发(如标签页后台),超时强制移除。
    window.setTimeout(() => splash.remove(), 600);
  }));
}
