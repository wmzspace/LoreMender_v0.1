import { useState } from "react";
import type { GameState } from "../data/types";
import type { PageKey } from "../lib/routes";
import { Topbar } from "../components";
import { Particles } from "../components/art";

interface ProgressPageProps {
  state: GameState;
  gotoPage: (p: PageKey) => void;
}

// ── 墨·青·金 配色（与 global.css 变量对齐） ──────────────────────
const GOLD_PALE = "#ecdca6";
const GOLD = "#cdb277";
const GOLD_DEEP = "#8f7846";
const GOLD_SHADOW = "#463c22";
const JADE = "#5fa892";
const JADE_PALE = "#a6dccb";
const INK = "#0c1218";
const INK_DEEP = "#0a1014";
const PAPER = "rgba(228,224,208,";

// ── 全部五章数据 ───────────────────────────────────────────────
const ALL_CHAPTERS = [
  {
    num: 1, numCn: "第一章", id: "ch1",
    title: "牢狱初醒",
    desc: "阿吉醒来，拼合竹简，与华佗首次对话。",
    preview: "建安十三年，许昌大牢。烛火摇曳中，阿吉从昏迷中醒来。面前是一位苍老的身影，正在拼合散落的竹简。师父的第一句话，将改变这一夜的走向……",
    characters: [
      { name: "华佗", portrait: "/images/levels/1/characters/huatuo_square.webp" },
      { name: "阿吉", portrait: "/images/levels/1/characters/aj_square.webp" },
    ],
  },
  {
    num: 2, numCn: "第二章", id: "ch2",
    title: "三人之试",
    desc: "走访三位候选人，通过对话识别各自真相。",
    preview: "三个人，一本书，只有一次机会。王济眼神游移，陈伯鞋上沾满泥土，玄音道人衣袂飘飘。看人不能只看表面，而你必须做出判断……",
    characters: [
      { name: "王济", portrait: "/images/levels/1/characters/wangji_square.webp" },
      { name: "陈伯", portrait: "/images/levels/1/characters/chenbo_square.webp" },
      { name: "玄音道人", portrait: "/images/levels/1/characters/xuanyin_square.webp" },
    ],
  },
  {
    num: 3, numCn: "第三章", id: "ch3",
    title: "曹府密谈",
    desc: "曹操召见，博弈周旋，面对交书换命的诱饵。",
    preview: "朱漆大堂，青铜灯树。魏王坐在上方，案上放着一卷竹简。「交出来，本王保你师徒平安。」权谋的压迫从四面合拢，你只能周旋……",
    characters: [
      { name: "曹操", portrait: "/images/levels/1/characters/caocao_square.webp" },
    ],
  },
  {
    num: 4, numCn: "第四章", id: "ch4",
    title: "青囊抉择",
    desc: "华佗囚室深夜，青囊残卷现世。",
    preview: "夜色沉入许昌大牢，青囊残卷终于现世。救一人，救一术，还是救万民？你将面对最后的抉择，而此前积累的信任、线索与疑点，都会在此刻改变命运的方向……",
    characters: [
      { name: "华佗", portrait: "/images/levels/1/characters/huatuo_square.webp" },
    ],
  },
  {
    num: 5, numCn: "第五章", id: "ch5",
    title: "千年回响",
    desc: "终章回响，理解修补的真正意义。",
    preview: "书烧了，他死了，可是——无论你做了哪个选择，历史的长河中总有一道涟漪。此后千年，那道涟漪会以何种方式被人记住？",
    characters: [
      { name: "华佗", portrait: "/images/levels/1/characters/huatuo_square.webp" },
      { name: "阿吉", portrait: "/images/levels/1/characters/aj_square.webp" },
    ],
  },
];

// ── 章节节点圆（冷墨底 · 烛光 · 金/青描边） ─────────────────────
function NodeMedallion({
  size = 64, dim = false, accent,
}: {
  size?: number;
  dim?: boolean;
  /** 高亮色：jade=当前章，gold=已完成首饰，undefined=普通描边 */
  accent?: "jade" | "gold";
}) {
  const r = size / 2;
  const uid = `${size}-${accent ?? "n"}`;
  const ring = accent === "jade" ? JADE : accent === "gold" ? GOLD : GOLD_SHADOW;
  const glow = !!accent;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ flexShrink: 0, opacity: dim ? 0.78 : 1, transition: "opacity 0.3s" }}>
      <defs>
        <radialGradient id={`cg-${uid}`} cx="50%" cy="44%" r="52%">
          <stop offset="0%" stopColor="#ffcf8a" stopOpacity="0.42" />
          <stop offset="52%" stopColor={GOLD_SHADOW} stopOpacity="0.3" />
          <stop offset="100%" stopColor="#06100e" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`cc-${uid}`}><circle cx={r} cy={r} r={r - 3} /></clipPath>
      </defs>
      {/* 外发光（高亮章节） */}
      {glow && (
        <circle cx={r} cy={r} r={r}
          fill="none" stroke={ring} strokeOpacity={0.28} strokeWidth={6}
          style={{ filter: "blur(4px)" }}
        />
      )}
      {/* 暗墨底 */}
      <circle cx={r} cy={r} r={r - 3} fill={INK} />
      {/* 烛光渐变 */}
      <circle cx={r} cy={r} r={r - 3} fill={`url(#cg-${uid})`} clipPath={`url(#cc-${uid})`} />
      {/* 内容：竹简 + 烛火 */}
      <g clipPath={`url(#cc-${uid})`} opacity={0.5}>
        {[0.34, 0.5, 0.66, 0.82].map((x, i) => (
          <line key={i}
            x1={r * x * 2} y1={r * 0.18} x2={r * x * 2} y2={r * 1.82}
            stroke={GOLD_DEEP} strokeWidth="0.7" opacity="0.4"
          />
        ))}
        <ellipse cx={r} cy={r * 0.54} rx="2.6" ry="5" fill="#ffd79a" opacity="0.9" />
        <ellipse cx={r} cy={r * 0.64} rx="5.5" ry="2.6" fill={GOLD} opacity="0.35" />
        <rect x={r - 1.8} y={r * 0.74} width="3.6" height={r * 0.5} fill={GOLD_SHADOW} opacity="0.6" />
      </g>
      {/* 描边 */}
      <circle cx={r} cy={r} r={r - 1.5}
        fill="none" stroke={ring}
        strokeWidth={glow ? 2 : 1.2}
        opacity={glow ? 1 : 0.55}
      />
    </svg>
  );
}

// ── 展开卡片内容 ───────────────────────────────────────────────
function ExpandedCard({
  ch, isCurrent, isDone, onEnter, onCollapse,
}: {
  ch: typeof ALL_CHAPTERS[0];
  isCurrent: boolean;
  isDone: boolean;
  onEnter: () => void;
  onCollapse: () => void;
}) {
  const edge = isCurrent ? JADE : GOLD_DEEP;
  return (
    <div style={{
      marginTop: 12,
      background: `linear-gradient(135deg, ${INK} 0%, ${INK_DEEP} 55%, #0b141a 100%)`,
      border: `1px solid ${isCurrent ? "rgba(95,168,146,0.7)" : "rgba(143,120,70,0.55)"}`,
      borderRadius: 3,
      padding: "13px 15px 15px",
      boxShadow: isCurrent
        ? "0 0 26px rgba(95,168,146,0.16), inset 0 0 30px rgba(0,0,0,0.5)"
        : "0 6px 20px rgba(0,0,0,0.5), inset 0 0 22px rgba(0,0,0,0.4)",
      position: "relative", overflow: "hidden" as const,
      animation: "expandCard 0.28s cubic-bezier(0.2,0.8,0.3,1) both",
    }}>
      {/* 顶部高光线 */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${edge}, transparent)`,
        opacity: 0.6,
      }} />

      {/* 章节标签行 + 收起 */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 10, position: "relative", zIndex: 1,
      }}>
        <div style={{
          fontSize: 10, color: `${PAPER}0.45)`, letterSpacing: "0.3em",
        }}>{ch.numCn}</div>
        <button
          onClick={onCollapse}
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: `${PAPER}0.4)`, fontSize: 10,
            padding: "2px 0", letterSpacing: "0.14em", fontFamily: "inherit",
          }}
        >收 起 ▲</button>
      </div>

      <div style={{ display: "flex", gap: 13, position: "relative", zIndex: 1 }}>
        <NodeMedallion size={88} accent={isCurrent ? "jade" : isDone ? "gold" : undefined} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{
              fontSize: 20, fontFamily: "'ZCOOL XiaoWei', serif",
              color: isCurrent ? JADE_PALE : GOLD_PALE,
              letterSpacing: "0.18em", textIndent: "0.18em",
              textShadow: isCurrent
                ? "0 0 12px rgba(166,220,203,0.4)"
                : "0 0 12px rgba(236,220,166,0.25)",
            }}>{ch.title}</div>
            {isCurrent && (
              <div style={{
                fontSize: 9, color: JADE_PALE,
                border: `1px solid ${JADE}`, borderRadius: 2, padding: "1px 6px",
                letterSpacing: "0.16em",
                animation: "glowPulse 2s ease-in-out infinite",
              }}>进 行 中</div>
            )}
            {isDone && (
              <div style={{
                fontSize: 9, color: GOLD_PALE,
                border: `1px solid ${GOLD_DEEP}`, borderRadius: 2, padding: "1px 6px",
                letterSpacing: "0.16em", opacity: 0.8,
              }}>已 通 览</div>
            )}
          </div>

          <div style={{
            fontSize: 11.5, color: `${PAPER}0.7)`,
            marginTop: 6, lineHeight: 1.65, letterSpacing: "0.03em",
          }}>{ch.desc}</div>

          {/* 分隔线 */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "10px 0 6px" }}>
            <div style={{ width: 16, height: 1, background: GOLD_DEEP }} />
            <div style={{ width: 3, height: 3, background: GOLD, borderRadius: "50%", opacity: 0.8 }} />
            <div style={{ flex: 1, height: 1, background: GOLD_DEEP, opacity: 0.35 }} />
          </div>

          <div style={{
            fontSize: 9.5, color: `rgba(236,220,166,0.55)`,
            letterSpacing: "0.2em", marginBottom: 4,
          }}>剧 情 预 览</div>
          <div style={{
            fontSize: 11, color: `${PAPER}0.62)`,
            lineHeight: 1.75, letterSpacing: "0.02em",
          }}>{ch.preview}</div>

          {/* 关键人物 */}
          {ch.characters && ch.characters.length > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              marginTop: 10,
            }}>
              <div style={{
                fontSize: 9, color: `rgba(236,220,166,0.55)`,
                letterSpacing: "0.2em",
              }}>关 键 人 物</div>
              <div style={{
                display: "flex", gap: 6,
              }}>
                {ch.characters.map((c, ci) => (
                  <div key={ci} style={{
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%",
                      overflow: "hidden",
                      border: `1px solid ${isCurrent ? "rgba(95,168,146,0.6)" : "rgba(205,178,119,0.4)"}`,
                      flexShrink: 0,
                    }}>
                      <img src={c.portrait} alt={c.name}
                        style={{width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top"}} />
                    </div>
                    <div style={{
                      fontSize: 10, color: `${PAPER}0.6)`,
                      letterSpacing: "0.06em",
                    }}>{c.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 进入按钮 */}
      <div style={{ marginTop: 14, position: "relative", zIndex: 1 }}>
        {isCurrent ? (
          <button className="btn-primary press" onClick={onEnter} style={{ width: "100%", minHeight: 46 }}>
            进 入 此 卷
          </button>
        ) : (
          <button className="btn-ghost press" onClick={onEnter} style={{ width: "100%", minHeight: 44 }}>
            重 温 此 卷
          </button>
        )}
      </div>
    </div>
  );
}

// ── 主组件 ──────────────────────────────────────────────────────
export function ProgressPage({ state, gotoPage }: ProgressPageProps) {
  const cur = state.currentChapter || 1;
  // 默认展开当前章节
  const [expanded, setExpanded] = useState<number>(cur);

  const toggle = (num: number) => setExpanded(prev => (prev === num ? -1 : num));

  // 节点列宽度：竖轴居中其内；ZIGZAG 为奇数章节的左右错位量
  const NODE_COL = 64;
  const ZIGZAG = 32;

  return (
    <div className="page night-bg">
      <Topbar title="副 本 进 程" onBack={() => gotoPage("story")} />
      <Particles count={7} />

      {/* 暗角 */}
      <div className="vignette" />

      {/* 右上角阁楼剪影（金线·极淡） */}
      <svg style={{ position: "absolute", right: 0, top: 40, opacity: 0.06, pointerEvents: "none" }}
        width="124" height="280" viewBox="0 0 124 280">
        <path d="M14 72 L62 36 L110 72 L114 72 L62 27 L10 72 Z" fill={GOLD_PALE} />
        <rect x="34" y="72" width="56" height="104" fill={GOLD_PALE} opacity="0.5" />
        <path d="M0 138 L62 94 L124 138 L124 141 L62 86 L0 141 Z" fill={GOLD_PALE} />
        <rect x="15" y="141" width="94" height="139" fill={GOLD_PALE} opacity="0.3" />
        {[0, 1, 2, 3].map(i => (
          <line key={i} x1={26 + i * 20} y1="160" x2={26 + i * 20} y2="268" stroke={GOLD_PALE} strokeWidth="1.1" />
        ))}
      </svg>

      <div className="page-scroll" style={{ top: 56, bottom: 0, padding: "0 16px calc(28px + var(--safe-bottom))" }}>
        {/* 顶部标题 */}
        <div className="fade-in" style={{ textAlign: "center", margin: "4px 0 18px" }}>
          <div className="en-small" style={{
            fontSize: 10, letterSpacing: "0.36em", color: GOLD_PALE, opacity: 0.6,
          }}>DUNGEON · PROGRESS</div>
          <div className="title-han" style={{
            fontSize: 22, color: GOLD_PALE, marginTop: 7,
            letterSpacing: "0.3em", textIndent: "0.3em",
            textShadow: "0 0 14px rgba(236,220,166,0.28)",
          }}>华 佗 · 青 囊 残 卷</div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 9 }}>
            <span style={{
              width: 44, height: 1,
              background: `linear-gradient(90deg, transparent, ${GOLD_PALE}, transparent)`,
            }} />
          </div>
          <div style={{
            fontSize: 11.5, marginTop: 11, color: `${PAPER}0.7)`,
            letterSpacing: "0.12em",
          }}>典故修补者 · 一夜五章</div>
        </div>

        {/* 章节时间线 */}
        <div style={{ position: "relative" }}>
          {/* 竖轴 */}
          <div style={{
            position: "absolute", left: NODE_COL / 2, top: 24, bottom: 24,
            width: 1.5, transform: "translateX(-50%)",
            background: `linear-gradient(180deg, transparent, ${GOLD_DEEP} 7%, ${GOLD_DEEP} 93%, transparent)`,
            opacity: 0.5,
            boxShadow: `0 0 8px rgba(205,178,119,0.25)`,
          }} />

          {ALL_CHAPTERS.map((ch, i) => {
            const unlocked = ch.num <= cur;
            const locked = !unlocked;
            const isCurrent = !locked && ch.num === cur;
            const isDone = unlocked && ch.num < cur;
            const isExpanded = expanded === ch.num && !locked;
            const accent = isCurrent ? "jade" : isDone ? "gold" : undefined;

            const titleColor = locked
              ? `${PAPER}0.38)`
              : isCurrent ? JADE_PALE : GOLD_PALE;
            // 左右交错：奇数章节整行右移 ZIGZAG，节点偏离烛芯，形成 S 形走向
            const shift = i % 2 === 1 ? ZIGZAG : 0;

            return (
              <div key={ch.id} className="fade-up"
                style={{
                  animationDelay: `${i * 80}ms`,
                  marginBottom: i === ALL_CHAPTERS.length - 1 ? 4 : 14,
                  opacity: locked ? 0.5 : 1, transition: "opacity 0.3s",
                }}>
                {/* 折叠行（左右交错） */}
                <div
                  onClick={locked ? undefined : () => toggle(ch.num)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    marginLeft: shift, position: "relative",
                    cursor: locked ? "default" : "pointer",
                  }}
                >
                  {/* 烛芯连接短线：仅错位章节绘制 */}
                  {shift > 0 && (
                    <div style={{
                      position: "absolute", left: NODE_COL / 2 - shift, top: "50%",
                      width: shift, height: 1.5, transform: "translateY(-50%)",
                      background: GOLD_DEEP, opacity: 0.45,
                    }} />
                  )}

                  {/* 节点列 */}
                  <div style={{
                    width: NODE_COL, flexShrink: 0,
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                  }}>
                    <div style={{
                      fontSize: 9, color: locked ? `${PAPER}0.4)` : "rgba(236,220,166,0.6)",
                      letterSpacing: "0.1em",
                    }}>{ch.numCn}</div>
                    <div style={{ position: "relative" }}>
                      <NodeMedallion size={isCurrent ? 64 : 58} dim={isDone} accent={accent} />
                      {isDone && (
                        <div style={{
                          position: "absolute", bottom: 0, right: 0,
                          width: 16, height: 16, borderRadius: "50%",
                          background: INK_DEEP, border: `1px solid ${GOLD}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <svg width="8" height="7" viewBox="0 0 8 7" fill="none">
                            <path d="M1 3.5 L3 5.5 L7 1" stroke={GOLD_PALE} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                      {locked && (
                        <div style={{
                          position: "absolute", inset: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <svg width="15" height="17" viewBox="0 0 15 17" fill="none">
                            <rect x="2" y="7.5" width="11" height="8.5" rx="1.5" fill={INK_DEEP} stroke={`${PAPER}0.5)`} strokeWidth="1" />
                            <path d="M4.5 7.5 V5 a3 3 0 0 1 6 0 V7.5" stroke={`${PAPER}0.5)`} strokeWidth="1" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 标题区 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 17, fontFamily: "'ZCOOL XiaoWei', serif",
                      color: titleColor,
                      letterSpacing: "0.14em", textIndent: "0.14em",
                      textShadow: isCurrent ? "0 0 10px rgba(166,220,203,0.35)" : "none",
                    }}>{locked ? "？ ？ ？" : ch.title}</div>
                    <div style={{
                      width: 34, height: 1,
                      background: `linear-gradient(90deg, ${isCurrent ? JADE : GOLD_DEEP}, transparent)`,
                      margin: "5px 0 4px",
                    }} />
                    <div style={{
                      fontSize: 11, color: locked ? `${PAPER}0.4)` : `${PAPER}0.55)`,
                      lineHeight: 1.5, letterSpacing: "0.03em",
                    }}>{locked ? "尚 未 解 锁" : ch.desc}</div>
                  </div>

                  {/* 状态箭头 */}
                  {!locked && (
                    <div style={{
                      flexShrink: 0, paddingRight: 2,
                      color: isCurrent ? JADE : "rgba(205,178,119,0.5)",
                      fontSize: 11,
                      transform: isExpanded ? "rotate(90deg)" : "none",
                      transition: "transform 0.25s",
                    }}>▶</div>
                  )}
                </div>

                {isExpanded && (
                  <ExpandedCard
                    ch={ch}
                    isCurrent={isCurrent}
                    isDone={isDone}
                    onEnter={() => gotoPage("story")}
                    onCollapse={() => setExpanded(-1)}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* 底部提示条 */}
        <div style={{ marginTop: 18 }}>
          <div style={{
            border: "1px solid rgba(143,120,70,0.4)", borderRadius: 3,
            padding: "10px 14px",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            background: "rgba(10,16,20,0.4)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 4, height: 4, background: JADE, transform: "rotate(45deg)", opacity: 0.7 }} />
              <div style={{ width: 12, height: 1, background: "rgba(205,178,119,0.4)" }} />
            </div>
            <div style={{
              fontSize: 11, color: `${PAPER}0.62)`,
              letterSpacing: "0.06em", textAlign: "center",
            }}>
              你的每一次选择，都会改变这段遗憾被记住的方式。
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 12, height: 1, background: "rgba(205,178,119,0.4)" }} />
              <div style={{ width: 4, height: 4, background: JADE, transform: "rotate(45deg)", opacity: 0.7 }} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes expandCard {
          from { opacity: 0; transform: translateY(-8px) scaleY(0.92); }
          to   { opacity: 1; transform: translateY(0)   scaleY(1); }
        }
      `}</style>
    </div>
  );
}
