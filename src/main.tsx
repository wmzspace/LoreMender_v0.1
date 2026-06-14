import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
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
