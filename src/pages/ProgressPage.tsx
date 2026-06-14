import { useState } from "react";
import type { GameState } from "../data/types";
import type { PageKey } from "../lib/routes";

interface ProgressPageProps {
  state: GameState;
  gotoPage: (p: PageKey) => void;
}

// ── 全部五章数据 ───────────────────────────────────────────────
const ALL_CHAPTERS = [
  {
    num: 1, numCn: "第一章", id: "ch1",
    title: "牢狱初醒",
    desc: "阿吉醒来，拼合竹简，与华佗首次对话。",
    preview: "建安十三年，许昌大牢。烛火摇曳中，阿吉从昏迷中醒来。面前是一位苍老的身影，正在拼合散落的竹简。师父的第一句话，将改变这一夜的走向……",
    isFinal: false,
  },
  {
    num: 2, numCn: "第二章", id: "ch2",
    title: "三人之试",
    desc: "走访三位候选人，通过对话识别各自真相。",
    preview: "三个人，一本书，只有一次机会。王济眼神游移，陈伯鞋上沾满泥土，玄音道人衣袂飘飘。看人不能只看表面，而你必须做出判断……",
    isFinal: false,
  },
  {
    num: 3, numCn: "第三章", id: "ch3",
    title: "曹府密谈",
    desc: "曹操召见，博弈周旋，面对交书换命的诱饵。",
    preview: "朱漆大堂，青铜灯树。魏王坐在上方，案上放着一卷竹简。「交出来，本王保你师徒平安。」权谋的压迫从四面合拢，你只能周旋……",
    isFinal: false,
  },
  {
    num: 4, numCn: "第四章", id: "ch4",
    title: "青囊抉择",
    desc: "华佗囚室深夜，青囊残卷现世。",
    preview: "夜色沉入许昌大牢，青囊残卷终于现世。救一人，救一术，还是救万民？你将面对最后的抉择，而此前积累的信任、线索与疑点，都会在此刻改变命运的方向……",
    isFinal: false,
  },
  {
    num: 5, numCn: "第五章", id: "ch5",
    title: "千年回响",
    desc: "结局演绎，知识卡解锁，海报生成。",
    preview: "书烧了，他死了，可是——无论你做了哪个选择，历史的长河中总有一道涟漪。此后千年，那道涟漪会以何种方式被人记住？",
    isFinal: true,
  },
];

// ── 圆形插画占位 ───────────────────────────────────────────────
function CircleIllust({
  size = 90, opacity = 1, glow = false,
}: {
  size?: number; opacity?: number; glow?: boolean;
}) {
  const r = size / 2;
  const uid = `${size}-${glow ? "g" : "n"}`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ flexShrink: 0, opacity, transition: "opacity 0.3s" }}>
      <defs>
        <radialGradient id={`cg-${uid}`} cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#d4943a" stopOpacity="0.6" />
          <stop offset="55%" stopColor="#5a3010" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0e0905" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`cc-${uid}`}><circle cx={r} cy={r} r={r - 3} /></clipPath>
      </defs>
      {/* 外发光 */}
      {glow && (
        <circle cx={r} cy={r} r={r}
          fill="none" stroke="rgba(201,161,74,0.25)" strokeWidth={6}
          style={{ filter: "blur(4px)" }}
        />
      )}
      {/* 描边 */}
      <circle cx={r} cy={r} r={r - 1.5}
        fill="none"
        stroke={glow ? "#c9a14a" : "#5a3a14"}
        strokeWidth={glow ? 2.5 : 1.5}
        opacity={glow ? 1 : 0.6}
      />
      {/* 暗背景 */}
      <circle cx={r} cy={r} r={r - 3} fill="#120a04" />
      {/* 烛光渐变 */}
      <circle cx={r} cy={r} r={r - 3} fill={`url(#cg-${uid})`} clipPath={`url(#cc-${uid})`} />
      {/* 内容 */}
      <g clipPath={`url(#cc-${uid})`} opacity={0.55}>
        {[0.32, 0.48, 0.63, 0.78].map((x, i) => (
          <line key={i}
            x1={r * x * 2} y1={r * 0.15} x2={r * x * 2} y2={r * 1.85}
            stroke="#7a5a28" strokeWidth="0.7" opacity="0.4"
          />
        ))}
        <ellipse cx={r} cy={r * 0.52} rx="3" ry="5.5" fill="#ffb93a" opacity="0.9" />
        <ellipse cx={r} cy={r * 0.62} rx="6" ry="3" fill="#d97a2b" opacity="0.4" />
        <rect x={r - 2} y={r * 0.72} width="4" height={r * 0.52} fill="#5a3a10" opacity="0.6" />
      </g>
    </svg>
  );
}

// ── 展开卡片内容 ───────────────────────────────────────────────
function ExpandedCard({
  ch, isCurrent, onEnter, onCollapse,
}: {
  ch: typeof ALL_CHAPTERS[0];
  isCurrent: boolean;
  onEnter: () => void;
  onCollapse: () => void;
}) {
  return (
    <div style={{
      marginTop: 10, marginLeft: 20,
      background: "linear-gradient(135deg, #2a1e0e 0%, #1e1508 50%, #221808 100%)",
      border: `1px solid ${isCurrent ? "#c9a14a" : "#5a3a14"}`,
      borderRadius: 4,
      padding: "12px 14px",
      boxShadow: isCurrent
        ? "0 0 28px rgba(201,161,74,0.18), inset 0 0 30px rgba(0,0,0,0.5)"
        : "0 4px 16px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.4)",
      position: "relative", overflow: "hidden" as const,
      // 展开动画
      animation: "expandCard 0.28s cubic-bezier(0.2,0.8,0.3,1) both",
    }}>
      {/* 章节标签行 + 收起按钮 */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 8, position: "relative", zIndex: 1,
      }}>
        <div style={{
          fontSize: 10, color: "rgba(201,161,74,0.55)",
          letterSpacing: "0.18em",
        }}>{ch.numCn}</div>
        <button
          onClick={onCollapse}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "rgba(201,161,74,0.4)", fontSize: 10,
            padding: "2px 0", letterSpacing: "0.1em",
            fontFamily: "inherit",
          }}
        >收起 ▲</button>
      </div>
      {/* 纸张内阴影 */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        boxShadow: "inset 0 0 16px rgba(0,0,0,0.6), inset 0 0 4px rgba(80,40,0,0.2)",
      }} />

      <div style={{ display: "flex", gap: 12, position: "relative", zIndex: 1 }}>
        {/* 左侧插画 */}
        <CircleIllust size={100} glow={isCurrent} />

        {/* 右侧文字 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            <div style={{
              fontSize: 20, color: isCurrent ? "#d4af6a" : "#b8965a",
              letterSpacing: "0.18em", textIndent: "0.18em",
              textShadow: isCurrent ? "0 0 12px rgba(212,175,106,0.4)" : "none",
            }}>{ch.title}</div>
            {isCurrent && (
              <div style={{
                fontSize: 9, color: "#c9a14a",
                border: "1px solid #c9a14a",
                borderRadius: 2, padding: "1px 5px",
                letterSpacing: "0.1em",
                animation: "glowPulse 2s ease-in-out infinite",
              }}>当前</div>
            )}
          </div>

          <div style={{
            fontSize: 11, color: "rgba(219,195,145,0.65)",
            marginTop: 5, lineHeight: 1.6, letterSpacing: "0.03em",
          }}>{ch.desc}</div>

          {/* 分隔线 */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, margin: "8px 0 5px" }}>
            <div style={{ width: 16, height: 1, background: "#7a5a28" }} />
            <div style={{ width: 3, height: 3, background: "#c9a14a", borderRadius: "50%", opacity: 0.7 }} />
            <div style={{ flex: 1, height: 1, background: "#7a5a28", opacity: 0.4 }} />
          </div>

          <div style={{
            fontSize: 9.5, color: "rgba(201,161,74,0.55)",
            letterSpacing: "0.14em", marginBottom: 3,
          }}>剧情预览</div>
          <div style={{
            fontSize: 10.5, color: "rgba(219,195,145,0.6)",
            lineHeight: 1.7, letterSpacing: "0.02em",
          }}>{ch.preview}</div>
        </div>
      </div>

      {/* 进入按钮 */}
      <div style={{ marginTop: 12, display: "flex", justifyContent: "center", position: "relative", zIndex: 1 }}>
        <button
          onClick={onEnter}
          className="press"
          style={{
            background: isCurrent
              ? "linear-gradient(180deg, #2a1c0a, #1a1006)"
              : "linear-gradient(180deg, #1e1608, #140e04)",
            border: `1.5px solid ${isCurrent ? "#c9a14a" : "#7a5a28"}`,
            borderRadius: 24,
            padding: "8px 28px",
            color: isCurrent ? "#d4af6a" : "#a07840",
            fontSize: 13,
            letterSpacing: "0.28em",
            textIndent: "0.28em",
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: 9,
            boxShadow: isCurrent
              ? "0 0 14px rgba(201,161,74,0.25), inset 0 0 6px rgba(201,161,74,0.05)"
              : "none",
            fontFamily: "'ZCOOL XiaoWei', serif",
          }}
        >
          <span>进入剧情</span>
          <svg width="14" height="9" viewBox="0 0 14 9" fill="none">
            <path d="M0 4.5 L10 4.5" stroke="currentColor" strokeWidth="1.1" />
            <path d="M7 1 L11.5 4.5 L7 8" stroke="currentColor" strokeWidth="1.1" fill="none" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── 主组件 ──────────────────────────────────────────────────────
export function ProgressPage({ state, gotoPage }: ProgressPageProps) {
  const cur = state.currentChapter || 1;
  // 终章(千年回响=结局演绎)在解锁任意结局后才算解锁
  const hasEnding = !!state.lastEnding || (state.unlockedEndings?.length ?? 0) > 0;
  // 默认展开当前章节
  const [expanded, setExpanded] = useState<number>(cur);

  const toggle = (num: number) => {
    setExpanded(prev => (prev === num ? -1 : num));
  };

  return (
    <div style={{
      position: "relative", width: "100%", height: "100%",
      background: "#0a0704", overflow: "hidden",
      fontFamily: "'ZCOOL XiaoWei', 'Ma Shan Zheng', serif",
    }}>
      {/* ── 背景 ── */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `
          radial-gradient(ellipse 70% 50% at 75% 15%, rgba(80,50,15,0.2) 0%, transparent 60%),
          radial-gradient(ellipse 50% 60% at 15% 75%, rgba(30,20,5,0.35) 0%, transparent 70%)
        `,
      }} />

      {/* 背景建筑（右侧） */}
      <svg style={{ position: "absolute", right: 0, top: 0, opacity: 0.07, pointerEvents: "none" }}
        width="130" height="300" viewBox="0 0 130 300">
        <path d="M15 75 L65 38 L115 75 L120 75 L65 28 L10 75 Z" fill="#c9a14a" />
        <rect x="35" y="75" width="58" height="110" fill="#c9a14a" opacity="0.5" />
        <path d="M0 145 L65 98 L130 145 L130 148 L65 90 L0 148 Z" fill="#c9a14a" />
        <rect x="15" y="148" width="100" height="145" fill="#c9a14a" opacity="0.3" />
        {[0, 1, 2].map(i => (
          <rect key={i} x={32 + i * 22} y="95" width="13" height="36" fill="none" stroke="#c9a14a" strokeWidth="0.8" />
        ))}
        {[0, 1, 2, 3].map(i => (
          <line key={i} x1={28 + i * 20} y1="168" x2={28 + i * 20} y2="280" stroke="#c9a14a" strokeWidth="1.2" />
        ))}
        <line x1="18" y1="210" x2="112" y2="210" stroke="#c9a14a" strokeWidth="0.8" />
      </svg>

      {/* 暗角 */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 88% 88% at 50% 50%, transparent 45%, rgba(0,0,0,0.65) 100%)",
      }} />

      {/* ── 滚动内容 ── */}
      <div style={{ position: "absolute", inset: 0, overflowY: "auto", overflowX: "hidden" }}
        className="no-scrollbar">

        {/* 顶部标题 */}
        <div style={{ position: "relative", padding: "16px 20px 12px" }}>
          <button
            onClick={() => gotoPage("story")}
            className="press"
            style={{
              position: "absolute", left: 16, top: 16,
              width: 36, height: 36, borderRadius: "50%",
              background: "transparent", border: "1.5px solid #c9a14a",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", padding: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path d="M9 1 L3 7 L9 13" stroke="#c9a14a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            </svg>
          </button>

          <div style={{ textAlign: "center", paddingTop: 4 }}>
            <div style={{
              fontSize: 22, color: "#d4af6a",
              letterSpacing: "0.3em", textIndent: "0.3em",
              textShadow: "0 0 16px rgba(212,175,106,0.35)",
            }}>副本进程</div>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 8, marginTop: 6,
            }}>
              {[true, false].map((left, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 3,
                  flexDirection: left ? "row" : "row-reverse" }}>
                  <div style={{ width: 20, height: 1, background: "#7a5a28", opacity: 0.7 }} />
                  <div style={{ width: 4, height: 4, background: "#c9a14a", transform: "rotate(45deg)", opacity: 0.8 }} />
                </div>
              ))}
              <div style={{
                fontSize: 11, color: "rgba(201,161,74,0.7)",
                letterSpacing: "0.1em", whiteSpace: "nowrap",
              }}>典故修补者 · 华佗青囊残卷</div>
            </div>
          </div>
        </div>

        {/* ── 章节列表 ── */}
        <div style={{ position: "relative", padding: "0 16px 8px" }}>
          {/* 竖线 */}
          <div style={{
            position: "absolute", left: 59, top: 10, bottom: 60,
            width: 1.5,
            background: "linear-gradient(180deg, transparent, #7a5a28 6%, #7a5a28 94%, transparent)",
            opacity: 0.5,
            boxShadow: "0 0 6px rgba(201,161,74,0.3)",
          }} />

          {ALL_CHAPTERS.map((ch, i) => {
            // 解锁规则:终章看是否已通关任一结局,其余看当前进度
            const unlocked = ch.isFinal ? hasEnding : ch.num <= cur;
            const locked = !unlocked;
            const isExpanded = expanded === ch.num && !locked;
            const isDone = unlocked && (ch.isFinal ? true : ch.num < cur);
            const isCurrent = !locked && !ch.isFinal && ch.num === cur;
            const rowOpacity = locked ? 0.4 : 1;
            // S 型错位：奇数章节靠左，偶数靠右
            const xShift = i % 2 === 0 ? 0 : 36;

            return (
              <div key={ch.id}
                className="fade-up"
                style={{
                  animationDelay: `${i * 80}ms`,
                  marginBottom: isExpanded ? 8 : 20,
                  paddingLeft: xShift,
                  opacity: rowOpacity,
                  transition: "opacity 0.3s",
                }}
              >
                {/* 折叠态：圆圈行（展开时完全隐藏） */}
                {!isExpanded && (
                  <div
                    onClick={locked ? undefined : () => toggle(ch.num)}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      cursor: locked ? "default" : "pointer",
                    }}
                  >
                    {/* 圆形节点 */}
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div style={{
                        position: "absolute", top: 4, right: "calc(100% + 6px)",
                        fontSize: 9, color: "rgba(201,161,74,0.65)",
                        letterSpacing: "0.08em", whiteSpace: "nowrap",
                        lineHeight: 1.3, textAlign: "right",
                      }}>
                        {ch.numCn.slice(0, 1)}<br />{ch.numCn.slice(1)}
                      </div>
                      <CircleIllust
                        size={72}
                        opacity={isDone ? 0.8 : 1}
                        glow={isCurrent}
                      />
                      {isDone && (
                        <div style={{
                          position: "absolute", bottom: 4, right: 4,
                          width: 14, height: 14, borderRadius: "50%",
                          background: "#1a1006", border: "1px solid #c9a14a",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <svg width="7" height="6" viewBox="0 0 7 6" fill="none">
                            <path d="M1 3 L3 5 L6 1" stroke="#c9a14a" strokeWidth="1.2" strokeLinecap="round" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* 标题区 */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: 17,
                        color: isCurrent ? "#d4af6a" : (isDone ? "#b8965a" : "rgba(180,145,80,0.55)"),
                        letterSpacing: "0.16em", textIndent: "0.16em",
                        textShadow: isCurrent ? "0 0 10px rgba(212,175,106,0.3)" : "none",
                      }}>{locked ? "？ ？ ？" : ch.title}</div>
                      <div style={{
                        width: 36, height: 1,
                        background: "linear-gradient(90deg, #7a5a28, transparent)",
                        margin: "4px 0 3px",
                      }} />
                      <div style={{
                        fontSize: 10.5, color: "rgba(201,161,74,0.45)",
                        lineHeight: 1.5, letterSpacing: "0.03em", maxWidth: 160,
                      }}>{locked ? "尚 未 解 锁" : ch.desc}</div>
                    </div>

                    {/* 展开箭头 / 锁 */}
                    <div style={{
                      flexShrink: 0, color: "rgba(201,161,74,0.4)",
                      fontSize: 11, paddingRight: 4,
                      display: "flex", alignItems: "center",
                    }}>
                      {locked ? (
                        <svg width="11" height="13" viewBox="0 0 11 13" fill="none">
                          <rect x="1" y="5.5" width="9" height="7" rx="1" stroke="currentColor" strokeWidth="1"/>
                          <path d="M3 5.5 V3.7 a2.5 2.5 0 0 1 5 0 V5.5" stroke="currentColor" strokeWidth="1"/>
                        </svg>
                      ) : "▶"}
                    </div>
                  </div>
                )}

                {isExpanded && (
                  <ExpandedCard
                    ch={ch}
                    isCurrent={isCurrent}
                    onEnter={() => gotoPage("story")}
                    onCollapse={() => setExpanded(-1)}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── 底部提示条 ── */}
        <div style={{ padding: "4px 20px 28px" }}>
          <div style={{
            border: "1px solid rgba(122,90,40,0.45)",
            borderRadius: 3, padding: "9px 14px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            background: "rgba(0,0,0,0.18)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 4, height: 4, background: "#c9a14a", transform: "rotate(45deg)", opacity: 0.55 }} />
              <div style={{ width: 12, height: 1, background: "rgba(201,161,74,0.35)" }} />
            </div>
            <div style={{
              fontSize: 10.5, color: "rgba(201,161,74,0.6)",
              letterSpacing: "0.07em", textAlign: "center",
            }}>
              你的每一次选择，都会改变这段遗憾被记住的方式。
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 12, height: 1, background: "rgba(201,161,74,0.35)" }} />
              <div style={{ width: 4, height: 4, background: "#c9a14a", transform: "rotate(45deg)", opacity: 0.55 }} />
            </div>
          </div>
        </div>
      </div>

      {/* expandCard keyframe */}
      <style>{`
        @keyframes expandCard {
          from { opacity: 0; transform: translateY(-8px) scaleY(0.92); }
          to   { opacity: 1; transform: translateY(0)   scaleY(1); }
        }
      `}</style>
    </div>
  );
}
