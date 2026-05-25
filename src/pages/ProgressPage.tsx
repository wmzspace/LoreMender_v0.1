import type { GameState } from "../data/types";
import type { PageKey } from "../lib/routes";

interface ProgressPageProps {
  state: GameState;
  gotoPage: (p: PageKey) => void;
}

// ── 章节数据（按新剧情） ─────────────────────────────────────────
const CHAPTER_DATA = [
  {
    num: 1, numCn: "第一章", id: "ch1",
    title: "牢狱初醒",
    desc: "阿吉醒来，拼合竹简，与华佗首次对话。",
    scene: "许昌大牢囚室",
    align: "left" as const,
  },
  {
    num: 2, numCn: "第二章", id: "ch2",
    title: "三人之试",
    desc: "走访三位候选人，通过对话识别各自真相。",
    scene: "医馆·街市·山林",
    align: "left" as const,
  },
  {
    num: 3, numCn: "第三章", id: "ch3",
    title: "曹府密谈",
    desc: "曹操召见，诗词对答博弈，面对交书换命的诱饵。",
    scene: "曹操府邸朱漆大堂",
    align: "left" as const,
  },
];

const LAST_CHAPTER = {
  num: 5, numCn: "第五章", id: "ch5",
  title: "千年回响",
  desc: "结局演绎，知识卡解锁，海报生成。",
};

// ── SVG 圆形插画占位（烛火风格） ───────────────────────────────
function CircleIllust({ size = 90, opacity = 1, glow = false }: { size?: number; opacity?: number; glow?: boolean }) {
  const r = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0, opacity }}>
      <defs>
        <radialGradient id={`cg-${size}-${glow}`} cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#d4943a" stopOpacity="0.55" />
          <stop offset="50%" stopColor="#5a3010" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0e0905" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`cc-${size}`}><circle cx={r} cy={r} r={r - 3} /></clipPath>
      </defs>
      {/* 外圈描边 */}
      <circle cx={r} cy={r} r={r - 1.5}
        fill="none"
        stroke={glow ? "#c9a14a" : "#7a5a28"}
        strokeWidth={glow ? 2.5 : 1.8}
        opacity={glow ? 1 : 0.75}
      />
      {glow && (
        <circle cx={r} cy={r} r={r - 1.5}
          fill="none" stroke="#e7c773" strokeWidth={1}
          opacity={0.4}
          style={{ filter: "blur(2px)" }}
        />
      )}
      {/* 暗背景 */}
      <circle cx={r} cy={r} r={r - 3} fill="#120a04" clipPath={`url(#cc-${size})`} />
      {/* 烛光氛围 */}
      <circle cx={r} cy={r} r={r - 3} fill={`url(#cg-${size}-${glow})`} clipPath={`url(#cc-${size})`} />
      {/* 简单线条装饰 */}
      <g clipPath={`url(#cc-${size})`} opacity={0.5}>
        {/* 竹简纹理 */}
        {[0.3, 0.45, 0.6, 0.75].map((x, i) => (
          <line key={i}
            x1={r * x * 2} y1={r * 0.2} x2={r * x * 2} y2={r * 1.8}
            stroke="#7a5a28" strokeWidth="0.8" opacity="0.4"
          />
        ))}
        {/* 烛火 */}
        <ellipse cx={r} cy={r * 0.55} rx="3" ry="5" fill="#ffb93a" opacity="0.8" />
        <ellipse cx={r} cy={r * 0.65} rx="5" ry="3" fill="#d97a2b" opacity="0.4" />
        {/* 烛台 */}
        <rect x={r - 2} y={r * 0.75} width="4" height={r * 0.5} fill="#5a3a10" opacity="0.6" />
      </g>
    </svg>
  );
}

// ── 蜿蜒路径 SVG ────────────────────────────────────────────────
function WavyPath() {
  return (
    <svg
      viewBox="0 0 280 420" width="280" height="420"
      style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: 0, pointerEvents: "none" }}
      preserveAspectRatio="none"
    >
      <defs>
        <filter id="glow-path">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* 发光路径 */}
      <path
        d="M 100 30 C 80 80, 160 120, 140 180 C 120 240, 60 280, 80 340 C 90 380, 130 400, 140 420"
        fill="none" stroke="#7a5a28" strokeWidth="2.5" opacity="0.5"
      />
      <path
        d="M 100 30 C 80 80, 160 120, 140 180 C 120 240, 60 280, 80 340 C 90 380, 130 400, 140 420"
        fill="none" stroke="#c9a14a" strokeWidth="1.2" opacity="0.7"
        filter="url(#glow-path)"
      />
      {/* 路径小光点 */}
      {[[140, 180], [80, 340]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="#c9a14a" opacity="0.5" />
      ))}
    </svg>
  );
}

// ── 主组件 ──────────────────────────────────────────────────────
export function ProgressPage({ state, gotoPage }: ProgressPageProps) {
  const cur = state.currentChapter || 4;

  return (
    <div style={{
      position: "relative", width: "100%", height: "100%",
      background: "#0a0704", overflow: "hidden",
      fontFamily: "'ZCOOL XiaoWei', 'Ma Shan Zheng', serif",
    }}>
      {/* ── 背景纹理 ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: `
          radial-gradient(ellipse 70% 50% at 75% 20%, rgba(80,50,15,0.25) 0%, transparent 60%),
          radial-gradient(ellipse 50% 60% at 20% 70%, rgba(30,20,5,0.4) 0%, transparent 70%),
          linear-gradient(180deg, #12090400 0%, #0d0804 100%)
        `,
        pointerEvents: "none",
      }} />

      {/* 背景建筑轮廓（右侧） */}
      <svg style={{ position: "absolute", right: 0, top: 0, opacity: 0.08, pointerEvents: "none" }}
        width="140" height="320" viewBox="0 0 140 320">
        {/* 屋檐 */}
        <path d="M20 80 L70 40 L120 80 L130 80 L70 30 L10 80 Z" fill="#c9a14a" />
        <rect x="40" y="80" width="60" height="120" fill="#c9a14a" opacity="0.5" />
        <path d="M5 150 L70 100 L135 150 L140 150 L70 90 L0 150 Z" fill="#c9a14a" />
        <rect x="20" y="150" width="100" height="150" fill="#c9a14a" opacity="0.3" />
        {/* 格窗 */}
        {[0, 1, 2].map(i => (
          <rect key={i} x={35 + i * 25} y="100" width="15" height="40" fill="none" stroke="#c9a14a" strokeWidth="1" />
        ))}
        {/* 铁栏 */}
        {[0, 1, 2, 3].map(i => (
          <line key={i} x1={30 + i * 20} y1="170" x2={30 + i * 20} y2="290" stroke="#c9a14a" strokeWidth="1.5" />
        ))}
        <line x1="20" y1="220" x2="120" y2="220" stroke="#c9a14a" strokeWidth="1" />
      </svg>

      {/* 暗角 */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 50%, rgba(0,0,0,0.7) 100%)",
      }} />

      {/* ── 可滚动内容 ── */}
      <div style={{
        position: "absolute", inset: 0,
        overflowY: "auto", overflowX: "hidden",
      }} className="no-scrollbar">

        {/* ── 顶部区域 ── */}
        <div style={{ position: "relative", padding: "16px 20px 12px" }}>
          {/* 返回按钮 */}
          <button
            onClick={() => gotoPage("story")}
            style={{
              position: "absolute", left: 16, top: 16,
              width: 36, height: 36, borderRadius: "50%",
              background: "transparent",
              border: "1.5px solid #c9a14a",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", padding: 0,
            }}
            className="press"
          >
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path d="M9 1 L3 7 L9 13" stroke="#c9a14a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            </svg>
          </button>

          {/* 主标题 */}
          <div style={{ textAlign: "center", paddingTop: 4 }}>
            <div style={{
              fontSize: 22, color: "#d4af6a",
              letterSpacing: "0.3em", textIndent: "0.3em",
              textShadow: "0 0 16px rgba(212,175,106,0.4)",
              fontWeight: 400,
            }}>副本进程</div>

            {/* 副标题装饰行 */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, marginTop: 6,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <div style={{ width: 20, height: 1, background: "#7a5a28", opacity: 0.7 }} />
                <div style={{ width: 4, height: 4, background: "#c9a14a", transform: "rotate(45deg)", opacity: 0.8 }} />
              </div>
              <div style={{
                fontSize: 11, color: "rgba(201,161,74,0.75)",
                letterSpacing: "0.12em", whiteSpace: "nowrap",
              }}>典故修补者 · 华佗青囊残卷</div>
              <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                <div style={{ width: 4, height: 4, background: "#c9a14a", transform: "rotate(45deg)", opacity: 0.8 }} />
                <div style={{ width: 20, height: 1, background: "#7a5a28", opacity: 0.7 }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── 章节路线区域 ── */}
        <div style={{ position: "relative", padding: "0 16px" }}>

          {/* 蜿蜒路径背景 */}
          <WavyPath />

          {/* ── 前三章（小节点样式） ── */}
          <div style={{ position: "relative", zIndex: 1 }}>
            {CHAPTER_DATA.map((ch, i) => {
              const isDone = ch.num < cur;
              const isCur = ch.num === cur;
              const nodeOpacity = isDone || isCur ? 1 : 0.5;
              // S型：1偏左，2偏右，3偏左
              const xOffset = i % 2 === 0 ? 0 : 40;

              return (
                <div key={ch.id}
                  className="fade-up"
                  style={{
                    animationDelay: `${i * 100}ms`,
                    display: "flex", alignItems: "flex-start",
                    marginBottom: 32,
                    paddingLeft: xOffset,
                    opacity: nodeOpacity,
                    position: "relative",
                  }}>
                  {/* 节点圆 */}
                  <div style={{ position: "relative", marginRight: 14, flexShrink: 0 }}>
                    {/* 章节标签（左上角） */}
                    <div style={{
                      position: "absolute", top: -2, left: -2,
                      fontSize: 9, color: "rgba(201,161,74,0.7)",
                      letterSpacing: "0.1em", whiteSpace: "nowrap",
                      transform: "translateX(-100%) translateX(-4px)",
                    }}>
                      {ch.numCn.slice(0, 1)}<br />{ch.numCn.slice(1)}
                    </div>
                    <CircleIllust size={86} opacity={nodeOpacity} glow={isCur} />
                  </div>

                  {/* 章节文字 */}
                  <div style={{ flex: 1, paddingTop: 12 }}>
                    <div style={{
                      fontSize: 20, color: isDone ? "#c9a14a" : "#d4af6a",
                      letterSpacing: "0.18em", textIndent: "0.18em",
                      lineHeight: 1.2,
                    }}>{ch.title}</div>
                    {/* 金色横线 */}
                    <div style={{
                      width: 60, height: 1,
                      background: "linear-gradient(90deg, #7a5a28, transparent)",
                      margin: "5px 0",
                    }} />
                    <div style={{
                      fontSize: 11.5, color: "rgba(219,195,145,0.7)",
                      lineHeight: 1.6, letterSpacing: "0.04em",
                    }}>{ch.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── 当前章节大卡片（第四章） ── */}
          <div
            className="fade-up"
            style={{
              position: "relative", zIndex: 2,
              marginBottom: 28, marginTop: 4,
              animation: "fadeUp 600ms ease both",
              animationDelay: "300ms",
            }}
          >
            {/* 左侧竖向章节标签 */}
            <div style={{
              position: "absolute", left: -8, top: 20, zIndex: 10,
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 0,
            }}>
              <div style={{
                background: "linear-gradient(180deg, #2a1a08, #1a0e04)",
                border: "1px solid #c9a14a",
                borderRadius: "3px 3px 0 0",
                padding: "8px 7px",
                fontSize: 11, color: "#c9a14a",
                letterSpacing: "0.25em", writingMode: "vertical-rl",
                textOrientation: "upright",
                boxShadow: "0 0 10px rgba(201,161,74,0.2)",
                lineHeight: 1.4,
              }}>第四章</div>
              {/* 标签底部装饰撕边 */}
              <div style={{
                width: "100%", height: 6,
                background: "linear-gradient(90deg, #1a0e04, #2a1a08, #1a0e04)",
                borderLeft: "1px solid #7a5a28", borderRight: "1px solid #7a5a28",
                clipPath: "polygon(0 0, 100% 0, 85% 100%, 50% 80%, 15% 100%)",
              }} />
            </div>

            {/* 卡片主体（羊皮纸质感） */}
            <div style={{
              marginLeft: 20,
              background: `
                linear-gradient(135deg, #2a1e0e 0%, #1e1508 40%, #251a0b 70%, #1a1006 100%)
              `,
              border: "1px solid #7a5a28",
              borderRadius: 4,
              padding: "14px 14px 14px 14px",
              boxShadow: `
                0 0 30px rgba(201,161,74,0.15),
                inset 0 0 40px rgba(0,0,0,0.5),
                0 8px 24px rgba(0,0,0,0.6)
              `,
              position: "relative",
              overflow: "hidden",
            }}>
              {/* 纸张纹理噪点 */}
              <div style={{
                position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                backgroundSize: "200px 200px",
              }} />
              {/* 边缘烧焦效果 */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                boxShadow: "inset 0 0 20px rgba(0,0,0,0.7), inset 0 0 5px rgba(80,40,0,0.3)",
              }} />

              {/* 卡片内部布局 */}
              <div style={{ display: "flex", gap: 12, position: "relative", zIndex: 1 }}>
                {/* 左侧大圆形插画 */}
                <div style={{ flexShrink: 0 }}>
                  <CircleIllust size={110} glow={true} />
                </div>

                {/* 右侧内容 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* 标题行 */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <div style={{
                      fontSize: 22, color: "#d4af6a",
                      letterSpacing: "0.2em", textIndent: "0.2em",
                      textShadow: "0 0 12px rgba(212,175,106,0.5)",
                    }}>青囊抉择</div>
                    {/* 当前标签 */}
                    <div style={{
                      fontSize: 10, color: "#c9a14a",
                      border: "1px solid #c9a14a",
                      borderRadius: 2, padding: "1px 5px",
                      letterSpacing: "0.1em",
                      animation: "glowPulse 2s ease-in-out infinite",
                    }}>当前</div>
                  </div>

                  {/* 短描述 */}
                  <div style={{
                    fontSize: 11.5, color: "rgba(219,195,145,0.75)",
                    marginTop: 4, lineHeight: 1.6, letterSpacing: "0.04em",
                  }}>华佗囚室深夜，青囊残卷现世。</div>

                  {/* 分隔线 */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 5, margin: "8px 0 6px",
                  }}>
                    <div style={{ width: 20, height: 1, background: "#7a5a28" }} />
                    <div style={{ width: 3, height: 3, background: "#c9a14a", borderRadius: "50%", opacity: 0.8 }} />
                    <div style={{ flex: 1, height: 1, background: "#7a5a28", opacity: 0.5 }} />
                  </div>

                  {/* 剧情预览 */}
                  <div style={{
                    fontSize: 10, color: "rgba(201,161,74,0.6)",
                    letterSpacing: "0.15em", marginBottom: 4,
                  }}>剧情预览</div>
                  <div style={{
                    fontSize: 11, color: "rgba(219,195,145,0.65)",
                    lineHeight: 1.7, letterSpacing: "0.03em",
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical" as const,
                    overflow: "hidden",
                  }}>
                    夜色沉入许昌大牢，青囊残卷终于现世。救一人，救一术，还是救万民？你将面对最后的抉择，而此前积累的信任、线索与疑点，都会在此刻改变命运的方向……
                  </div>
                </div>
              </div>

              {/* 进入剧情按钮 */}
              <div style={{ marginTop: 14, display: "flex", justifyContent: "center", position: "relative", zIndex: 1 }}>
                <button
                  onClick={() => gotoPage("story")}
                  className="press"
                  style={{
                    background: "linear-gradient(180deg, #2a1c0a, #1a1006)",
                    border: "1.5px solid #c9a14a",
                    borderRadius: 24,
                    padding: "9px 32px",
                    color: "#d4af6a",
                    fontSize: 14,
                    letterSpacing: "0.3em",
                    textIndent: "0.3em",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 10,
                    boxShadow: "0 0 16px rgba(201,161,74,0.3), inset 0 0 8px rgba(201,161,74,0.05)",
                    fontFamily: "'ZCOOL XiaoWei', serif",
                  }}
                >
                  <span>进入剧情</span>
                  <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                    <path d="M0 5 L11 5" stroke="#c9a14a" strokeWidth="1.2" />
                    <path d="M8 1 L13 5 L8 9" stroke="#c9a14a" strokeWidth="1.2" fill="none" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* ── 第五章（弱化节点） ── */}
          <div
            className="fade-up"
            style={{
              display: "flex", alignItems: "flex-start",
              opacity: 0.5, marginBottom: 32,
              paddingLeft: 20, position: "relative", zIndex: 1,
              animationDelay: "400ms",
            }}
          >
            {/* 节点圆 */}
            <div style={{ position: "relative", marginRight: 14, flexShrink: 0 }}>
              <div style={{
                position: "absolute", top: 0, left: 0,
                fontSize: 9, color: "rgba(201,161,74,0.5)",
                letterSpacing: "0.1em",
                transform: "translateX(-100%) translateX(-4px)",
                whiteSpace: "nowrap",
                writingMode: "vertical-rl",
              }}>{LAST_CHAPTER.numCn}</div>
              <CircleIllust size={72} opacity={0.6} />
            </div>
            {/* 文字 */}
            <div style={{ flex: 1, paddingTop: 8 }}>
              <div style={{
                fontSize: 18, color: "rgba(180,145,80,0.65)",
                letterSpacing: "0.16em", textIndent: "0.16em",
              }}>{LAST_CHAPTER.title}</div>
              <div style={{
                width: 40, height: 1,
                background: "linear-gradient(90deg, rgba(122,90,40,0.5), transparent)",
                margin: "4px 0",
              }} />
              <div style={{
                fontSize: 11, color: "rgba(180,145,80,0.5)",
                lineHeight: 1.6, letterSpacing: "0.04em",
              }}>{LAST_CHAPTER.desc}</div>
            </div>
          </div>
        </div>

        {/* ── 底部提示条 ── */}
        <div style={{ padding: "0 20px 24px" }}>
          <div style={{
            border: "1px solid rgba(122,90,40,0.5)",
            borderRadius: 3,
            padding: "10px 16px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            background: "rgba(0,0,0,0.2)",
          }}>
            {/* 左装饰 */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 4, height: 4, background: "#c9a14a", transform: "rotate(45deg)", opacity: 0.6 }} />
              <div style={{ width: 14, height: 1, background: "rgba(201,161,74,0.4)" }} />
            </div>
            <div style={{
              fontSize: 11, color: "rgba(201,161,74,0.65)",
              letterSpacing: "0.08em", textAlign: "center", lineHeight: 1.6,
              flex: 1,
            }}>
              你的每一次选择，都会改变这段遗憾被记住的方式。
            </div>
            {/* 右装饰 */}
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 14, height: 1, background: "rgba(201,161,74,0.4)" }} />
              <div style={{ width: 4, height: 4, background: "#c9a14a", transform: "rotate(45deg)", opacity: 0.6 }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
