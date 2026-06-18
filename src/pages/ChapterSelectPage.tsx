import { useEffect, useRef, useState } from "react";
import { PageShell } from "../components";
import { bgmPath, playBgm, stopBgm } from "../lib/audio";
import type { GameState } from "../data/types";

interface ChapterSelectPageProps {
  onBack: () => void;
  onEnter: () => void;
  state: GameState;
}

interface Volume {
  num: string;
  han: string;
  title: string;
  lines: string[];
  open: boolean;
  image?: string;
}

const VOLUMES: Volume[] = [
  {
    num: "第 一 卷", han: "壹",
    title: "华佗 · 青囊残卷",
    lines: [
      "建安年间，华佗将死，《青囊经》即将失传。",
      "你醒来时，成了华佗身边最不起眼的小徒弟。",
      "你不能救他，但你还有一夜，可以决定医道是否断绝。",
    ],
    open: true,
  },
  { num: "第 二 卷", han: "贰", title: "李白 · 谪仙遗恨", lines: ["长安一片月，万户不敢扣门。"], open: false, image: "/images/levels/2/cover.png" },
  { num: "第 三 卷", han: "叁", title: "岳飞 · 风波未平", lines: ["风波亭外，何人为他递一柄伞。"], open: false, image: "/images/levels/3/cover.png" },
  { num: "第 四 卷", han: "肆", title: "梁祝 · 化蝶之前", lines: ["未化蝶前，他们还有最后一次开口。"], open: false, image: "/images/levels/4/cover.png" },
  { num: "第 五 卷", han: "伍", title: "孟姜女 · 长城悲歌", lines: ["她不必哭倒长城，只想认回一具骨。"], open: false, image: "/images/levels/5/cover.png" },
];

/** 已开放卷封面：图与视频交替——首次图停留 1s,之后每次 2.5s,中间各播一遍视频,循环。 */
function CoverMedia({ audible }: { audible: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);
  // hasPlayed 只在「视频真正播完」时翻转,不受 StrictMode 双调用 effect 影响,
  // 保证首轮图片停留 1s、之后每轮 2.5s。
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    if (showVideo) {
      const v = videoRef.current;
      if (!v) return;
      v.currentTime = 0;
      v.play().catch(() => setShowVideo(false));
    } else {
      const hold = hasPlayed ? 2500 : 1000;
      const t = window.setTimeout(() => setShowVideo(true), hold);
      return () => window.clearTimeout(t);
    }
  }, [showVideo, hasPlayed]);

  // BGM 仅在第一卷可见、且封面视频已开始播放时响起；切到其它卷（audible=false）即停。
  // 图片/视频交替间隙不打断（playBgm 同源幂等；hasPlayed 后切回也立即续上）。
  useEffect(() => {
    if (audible && (showVideo || hasPlayed)) {
      const src = bgmPath(1);
      if (src) playBgm(src);
    } else if (!audible) {
      stopBgm();
    }
  }, [audible, showVideo, hasPlayed]);

  return (
    <>
      <img
        src="/images/levels/1/chapters/dungeon_cover_huatuo.webp"
        alt=""
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <video
        ref={videoRef}
        muted playsInline
        onEnded={() => { setHasPlayed(true); setShowVideo(false); }}
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
          opacity: showVideo ? 1 : 0, transition: "opacity 600ms ease",
          pointerEvents: "none",
        }}
      >
        <source src="/videos/levels/1/dungeon_cover_huatuo.mp4" type="video/mp4" />
      </video>
    </>
  );
}

function VolumePanel({
  vol, index, comingSoon, onEnter, panelRef, audible,
}: {
  vol: Volume;
  index: number;
  comingSoon: boolean;
  onEnter: () => void;
  panelRef: (el: HTMLDivElement | null) => void;
  audible: boolean;
}) {
  return (
    <section ref={panelRef} data-idx={index} className="volume-panel">
      <div className="volume-bg">
        {vol.open ? (
          <CoverMedia audible={audible} />
        ) : vol.image ? (
          <img src={vol.image} alt="" className="volume-img--locked" />
        ) : (
          <div className="volume-bg--locked">
            <span className="volume-watermark" aria-hidden="true">{vol.han}</span>
          </div>
        )}
      </div>
      <div className="volume-scrim" />
      {!vol.open && <div className="volume-lock-wash" />}

      <div className="volume-content">
        <div className="volume-eyebrow">{vol.num}{vol.open ? " · 已 启" : " · 未 启 之 卷"}</div>
        <div className={"volume-title" + (vol.open ? "" : " is-locked")}>{vol.title}</div>
        <div className="volume-accent" />
        <div className="volume-desc">
          {vol.lines.map((l, i) => <div key={i}>{l}</div>)}
        </div>

        {vol.open ? (
          <div className="volume-cta">
            <button className="btn-primary press" data-sfx="confirm" onClick={onEnter} style={{ width: "100%" }}>
              进 入 此 卷
            </button>
          </div>
        ) : (
          <span className="volume-pending">{comingSoon ? "敬 请 期 待" : "完 成 前 卷 解 锁"}</span>
        )}
      </div>
    </section>
  );
}

export function ChapterSelectPage({ onBack, onEnter, state }: ChapterSelectPageProps) {
  const cleared = state.unlockedEndings.length > 0;
  const [active, setActive] = useState(0);
  const panels = useRef<(HTMLDivElement | null)[]>([]);

  // 离开典故卷宗即停止 BGM（封面视频起的曲子不应延续到其它界面）。
  useEffect(() => () => stopBgm(), []);

  useEffect(() => {
    const root = panels.current[0]?.parentElement ?? null;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.intersectionRatio >= 0.5) {
            setActive(Number((e.target as HTMLElement).dataset.idx));
          }
        });
      },
      { root, threshold: [0.5] }
    );
    panels.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const goTo = (i: number) => panels.current[i]?.scrollIntoView({ behavior: "smooth" });

  return (
    <PageShell
      title="典 故 卷 宗"
      subtitle={VOLUMES[active].num}
      onBack={onBack}
      wrap={false}
      bodyPadding="0"
      bodyClassName="volume-scroll"
    >
      {VOLUMES.map((vol, i) => (
        <VolumePanel
          key={vol.title}
          vol={vol}
          index={i}
          comingSoon={cleared}
          onEnter={onEnter}
          panelRef={(el) => { panels.current[i] = el; }}
          audible={active === i}
        />
      ))}

      {/* 右侧分卷指示器 */}
      <div className="volume-pager">
        {VOLUMES.map((vol, i) => (
          <button
            key={i}
            className={"vp-dot" + (active === i ? " active" : "")}
            onClick={() => goTo(i)}
            aria-label={vol.num}
            title={vol.title}
          />
        ))}
      </div>
    </PageShell>
  );
}
