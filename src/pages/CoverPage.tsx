import { useEffect, useRef, useState, type ReactNode } from "react";
import { ShowcasePage } from "./ShowcasePage";
import { stopBgm } from "../lib/audio";
import { isPrologueSeen, markPrologueSeen } from "../lib/storage";
import { TitleSequence, titleCardContent, studioCardContent, DialogueBox, ProgressDots, SoundSettings } from "../components";
import type { DialogueBoxHandle } from "../components/DialogueBox";

interface CoverPageProps {
  /** 进入游戏(播完开场动画后由 App 跳转到卷宗)。 */
  onStart: () => void;
}

/** 封面图(cover.jpg)原始像素尺寸,与下方 PORTAL_BBOX 一起标定漩涡在美术里的真实范围。 */
const COVER_IMG_W = 2752;
const COVER_IMG_H = 1536;
/** 漩涡可点击范围,按 cover.jpg 自身坐标系(0–1)标定,量自实际美术效果。
 *  不用画一个圈去近似它——直接按背景 background-size:cover / position:center top 的换算公式
 *  把这个范围投影到当前视口,缩放/换屏幕比例时始终贴合画面里的漩涡,不需要再调參数。 */
const PORTAL_BBOX = { left: 0.3, top: 0.2, right: 0.7, bottom: 0.8 };

/** 计算 PORTAL_BBOX 在当前视口下的像素位置(随 resize 重算)。 */
function usePortalRect() {
  const [rect, setRect] = useState({ left: 0, top: 0, width: 0, height: 0 });
  useEffect(() => {
    const compute = () => {
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      const scale = Math.max(cw / COVER_IMG_W, ch / COVER_IMG_H);
      const renderedW = COVER_IMG_W * scale;
      const renderedH = COVER_IMG_H * scale;
      // backgroundPosition: "center top" → 水平居中裁切,垂直贴顶(顶边永远对齐,偏移为 0)
      const offsetX = (cw - renderedW) / 2;
      setRect({
        left: offsetX + PORTAL_BBOX.left * renderedW,
        top: PORTAL_BBOX.top * renderedH,
        width: (PORTAL_BBOX.right - PORTAL_BBOX.left) * renderedW,
        height: (PORTAL_BBOX.bottom - PORTAL_BBOX.top) * renderedH,
      });
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return rect;
}

/** 序幕主线设定对白（漩涡点击后立即出现，逐句累积、轻触推进；最多 3 轮）。 */
const PROLOGUE_LINES = [
  "深夜，文化博物馆数字修复组。一名年轻研究员在库房深处，触到一卷没有编号、无从考证来源的古卷——《拾遗残卷》。刹那间馆中古物被逐一点亮，一道通往历史的裂隙在眼前裂开。",
  "他成了「典故修补者」，被送往一个个历史节点，去见那些被写进史书、却仍留下遗憾的人。他的任务不是改写历史，而是理解遗憾、修补缺口——凭对话、选择与解谜取得信任，助他们完成未竟之愿。",
  "每修补一段典故，便能得到一件信物：一枚药签、一页残诗、一段曲谱，或只是一句终于被记下来的话；《拾遗残卷》也随之点亮一处空白。",
  "唯有集齐所有信物、令《拾遗残卷》重新被填满，那道归途才会重新敞开——他才能穿越回自己的时代。第一道裂隙，停在了建安十三年的许昌。",
];

/**
 * 序幕场景：文化博物馆库房。
 * 先黑屏过场序列（序幕标题卡 → 拾遗工作室署名卡），再进底部对话框逐句旁白
 * （复用章节同款 DialogueBox：打字机 + 上一句/自动/快进控制条），与正文一致。
 */
function PrologueScene({ onDone }: { onDone: () => void; replay?: boolean }) {
  const [idx, setIdx] = useState(0);
  // intro=黑屏过场序列；dialogue=底部对话框旁白。
  const [stage, setStage] = useState<"intro" | "dialogue">("intro");
  const [autoOn, setAutoOn] = useState(false);
  const autoTimer = useRef<number>(0);
  const dialogueRef = useRef<DialogueBoxHandle>(null);
  const last = idx >= PROLOGUE_LINES.length - 1;
  // 序幕 BGM 用剧情外统一主题曲，由 App（cover 页）统一播放，这里无需单独管理。

  const next = () => {
    if (!last) setIdx(idx + 1);
    else onDone();
  };
  const prev = () => { if (idx > 0) setIdx(idx - 1); };

  const clearAuto = () => { if (autoTimer.current) { window.clearTimeout(autoTimer.current); autoTimer.current = 0; } };
  useEffect(() => clearAuto, []);

  return (
    <div className="prologue-scene" role="button" aria-label="序幕">
      <img src="/images/cover.jpg" className="prologue-bg" alt="" />
      <div
        className="prologue-scrim"
        onClick={() => dialogueRef.current?.advance()}
        style={stage === "dialogue" ? { pointerEvents: "auto", cursor: "pointer" } : undefined}
      />
      <div className="grain" />

      {stage === "intro" ? (
        <TitleSequence
          cards={[titleCardContent("序 幕", "典 故 修 补 者"), studioCardContent()]}
          onDone={() => setStage("dialogue")}
        />
      ) : (
        <>
          <div className="cover-sound-settings" onClick={(e) => e.stopPropagation()}>
            <SoundSettings />
          </div>
          <div style={{
            position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 3,
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            padding: "0 24px calc(18px + env(safe-area-inset-bottom, 0px))",
          }}>
            <ProgressDots total={PROLOGUE_LINES.length} current={idx + 1} />
            <DialogueBox
              ref={dialogueRef}
              key={idx}
              text={PROLOGUE_LINES[idx]}
              isNarration
              onNext={next}
              onPrev={prev}
              canPrev={idx > 0}
              autoOn={autoOn}
              onToggleAuto={() => setAutoOn(v => !v)}
              onTypingDone={() => {
                if (autoOn) { clearAuto(); autoTimer.current = window.setTimeout(next, 1600); }
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

/** 封面弹层:设定 / 档案以居中对话框呈现(带遮罩、限高),停留在封面,不进入游戏内、不暴露侧栏。 */
function CoverModal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="cover-modal-backdrop" onClick={onClose}>
      <div className="cover-modal-dialog" onClick={(e) => e.stopPropagation()}>
        {children}
        <button className="cover-modal-close press" onClick={onClose} aria-label="关闭">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2 L12 12 M12 2 L2 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/** 封面动态背景:封面图与视频交替——图停留 2.5s,再播一遍视频,如此循环。
 *  底层 cover.jpg 始终在 CoverPage 中渲染;此处视频层淡入/淡出叠加在其上。 */
const IMAGE_HOLD_MS = 1500;

function CoverVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (showVideo) {
      const v = videoRef.current;
      if (!v) return;
      v.currentTime = 0;
      // muted 播放无需用户手势;失败则回到图片阶段继续循环
      v.play().catch(() => setShowVideo(false));
    } else {
      const t = window.setTimeout(() => setShowVideo(true), IMAGE_HOLD_MS);
      return () => window.clearTimeout(t);
    }
  }, [showVideo]);

  return (
    <video
      ref={videoRef}
      muted playsInline
      onEnded={() => setShowVideo(false)}
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%", objectFit: "cover",
        opacity: showVideo ? 1 : 0,
        transition: "opacity 600ms ease",
        pointerEvents: "none",
      }}
    >
      <source src="/videos/cover.mp4" type="video/mp4" />
    </video>
  );
}

/** 点击「开始修补」后的全屏开场动画;播完或跳过后进入卷宗。 */
function IntroVideo({ onDone }: { onDone: () => void }) {
  const doneRef = useRef(false);
  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };
  return (
    <div
      onClick={finish}
      role="button"
      aria-label="轻触以跳过动画"
      style={{
        position: "absolute", inset: 0, zIndex: 100,
        background: "#000",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "fadeIn 280ms ease both",
        cursor: "pointer",
      }}
    >
      <video
        autoPlay playsInline
        onEnded={finish}
        onError={finish}
        style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
      >
        <source src="/videos/start.mp4" type="video/mp4" />
      </video>
      <div style={{
        position: "absolute",
        bottom: "calc(34px + env(safe-area-inset-bottom,0px))",
        left: 0, right: 0,
        textAlign: "center",
        fontFamily: "var(--font-han)",
        fontSize: 13,
        letterSpacing: "0.32em", textIndent: "0.32em",
        color: "rgba(236,220,166,0.78)",
        textShadow: "0 1px 8px rgba(0,0,0,0.9)",
        pointerEvents: "none",
        animation: "skipBlink 2.6s ease-in-out infinite",
      }}>轻 触 以 跳 过 动 画</div>
    </div>
  );
}

export function CoverPage({ onStart }: CoverPageProps) {
  // 流程：cover(封面) → [首次] prologue(序幕对白) → intro(开场动画) → onStart(卷宗页)
  //       序幕只首次自动播一次；「查看设定」可重看序幕（看完返回封面）。
  const [phase, setPhase] = useState<"cover" | "prologue" | "prologue-replay" | "intro">("cover");
  const [modal, setModal] = useState<null | "showcase">(null);
  const portalRect = usePortalRect();

  // 开始游戏（点击漩涡 / 弹层「进入」）：未看过序幕 → 先播序幕；已看过 → 直接开场动画
  const beginGame = () => {
    setModal(null);
    if (isPrologueSeen()) setPhase("intro");
    else setPhase("prologue");
  };

  // 查看设定：重看序幕，看完返回封面（不进入游戏）
  const replayPrologue = () => { setModal(null); setPhase("prologue-replay"); };

  // 开场动画阶段停掉主题曲，让 start.mp4 自身音频清晰播放；动画结束进卷宗页后 App 会续播主题曲。
  useEffect(() => {
    if (phase === "intro") stopBgm();
  }, [phase]);

  if (phase === "prologue") {
    // 首次：看完标记已看过 → 进开场动画
    return <PrologueScene onDone={() => { markPrologueSeen(); setPhase("intro"); }} />;
  }
  if (phase === "prologue-replay") {
    return <PrologueScene replay onDone={() => setPhase("cover")} />;
  }
  if (phase === "intro") {
    return <IntroVideo onDone={onStart} />;
  }

  return (
    <div className="page night-deep-bg">
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "url(/images/cover.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center top",
        backgroundColor: "#06090b",
      }} />
      <CoverVideo />
      <div style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        background: "linear-gradient(180deg, rgba(5,8,11,0.25) 0%, transparent 22%, transparent 48%, rgba(5,8,11,0.55) 76%, rgba(5,3,2,0.97) 100%)",
      }} />

      <div className="grain" />
      <div className="vignette" />

      <div className="en-small fade-in" style={{
        position: "absolute",
        top: "calc(20px + env(safe-area-inset-top,0px))",
        left: 26,
        zIndex: 3,
        fontSize: 10,
        letterSpacing: "0.34em",
        color: "var(--gold-pale)",
        opacity: 0.55,
        textShadow: "0 1px 6px rgba(0,0,0,0.8)",
      }}>The LOREMENDER</div>

      <div className="cover-sound-settings">
        <SoundSettings />
      </div>

      <div style={{
        position: "absolute",
        inset: "calc(14px + env(safe-area-inset-top,0px)) 14px calc(14px + var(--safe-bottom))",
        border: "1px solid rgba(205,178,119,0.32)",
        borderRadius: 2,
        pointerEvents: "none",
        zIndex: 3,
      }} />
      <div style={{
        position: "absolute",
        inset: "calc(18px + env(safe-area-inset-top,0px)) 18px calc(18px + var(--safe-bottom))",
        border: "1px solid rgba(205,178,119,0.13)",
        borderRadius: 2,
        pointerEvents: "none",
        zIndex: 3,
      }} />

      {/* 点击封面漩涡进入游戏:范围贴合美术里漩涡的真实位置(见 usePortalRect),不再额外画圈示意。
          z-index 低于下方「查看设定/参赛档案」按钮,小屏下若区域重叠,以那些按钮优先响应点击。 */}
      <div
        className="cover-portal-wrap"
        style={{ left: portalRect.left, top: portalRect.top, width: portalRect.width, height: portalRect.height }}
      >
        <button
          className="cover-portal press"
          data-sfx="nav"
          onClick={beginGame}
          aria-label="点击传送门，开始修补"
        />
      </div>
      {/* 提示文字锚在底部按钮区上方(纯 CSS bottom 定位),不随 PORTAL_BBOX 调整而移动。 */}
      <div className="cover-portal-hint" aria-hidden="true">轻 触 漩 涡 · 开 始 修 补</div>

      <div style={{
        position: "absolute", inset: 0,
        zIndex: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "0 28px calc(40px + var(--safe-bottom))",
        // 整块容器铺满全屏,但空白区不可拦截点击——否则会盖住中央传送门。
        pointerEvents: "none",
      }}>
        <div className="fade-up cover-actions" style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: "100%",
          maxWidth: 440,
          animationDelay: "200ms",
          pointerEvents: "auto",
        }}>
          <button className="btn-ghost press" onClick={replayPrologue}>查看设定</button>
          <button className="btn-ghost press" onClick={() => setModal("showcase")}>参赛档案</button>
        </div>
      </div>

      {modal === "showcase" && (
        <CoverModal onClose={() => setModal(null)}>
          <ShowcasePage onBack={() => setModal(null)} onEnter={beginGame} />
        </CoverModal>
      )}
    </div>
  );
}
