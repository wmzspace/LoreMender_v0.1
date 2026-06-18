import type { ReactNode } from "react";
import type { PageKey } from "../lib/routes";
import { SoundSettings } from "./SoundSettings";

interface SideNavProps {
  active: PageKey;
  onNav: (key: PageKey) => void;
  /** 点击收起(完全隐藏侧栏,由 App 改为单列全宽)。 */
  onCollapse?: () => void;
}

interface NavItem {
  key: PageKey;
  label: string;
  icon: ReactNode;
}

/** 桌面端持久左侧导航。CSS 默认 display:none,在 @media (min-width:1024px) 显示。 */
export function SideNav({ active, onNav, onCollapse }: SideNavProps) {
  const items: NavItem[] = [
    {
      key: "story", label: "剧情故事",
      icon: <ScrollIcon />,
    },
    {
      key: "chapters", label: "副本卷宗",
      icon: <VolumeIcon />,
    },
    {
      key: "clue", label: "线索板",
      icon: <LanternIcon />,
    },
    {
      key: "map", label: "副本进程",
      icon: <NodeIcon />,
    },
    {
      key: "gallery", label: "结局图鉴",
      icon: <SealIcon />,
    },
    {
      key: "world", label: "典籍设定",
      icon: <BookIcon />,
    },
    {
      key: "showcase", label: "参赛档案",
      icon: <ArchiveIcon />,
    },
  ];

  return (
    <nav className="sidenav" aria-label="主导航">
      <div className="sidenav-logo">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="en-small" style={{
              fontSize: 9, letterSpacing: "0.34em",
              color: "var(--gold-pale)", opacity: 0.5,
              marginBottom: 6,
            }}>THE LOREMENDER</div>
            <div className="title-han" style={{
              fontSize: 17, color: "var(--gold-pale)",
              letterSpacing: "0.28em", textIndent: "0.28em",
              textShadow: "0 0 12px rgba(236,220,166,0.3)",
            }}>典故修补者</div>
            <div style={{
              fontSize: 10, color: "rgba(228,224,208,0.4)",
              letterSpacing: "0.2em", marginTop: 4,
              fontFamily: "var(--font-han)",
            }}>青 囊 残 卷</div>
          </div>
          {onCollapse && (
            <button
              className="icon-btn press"
              data-sfx="nav"
              onClick={onCollapse}
              aria-label="收起导航"
              style={{
                width: 30, height: 30, flexShrink: 0,
                fontSize: 13,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8 2 L4 6 L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="sidenav-nav">
        {items.map(it => (
          <button
            key={it.key}
            className={"navitem press " + (active === it.key ? "active" : "")}
            data-sfx="nav"
            onClick={() => onNav(it.key)}
            aria-current={active === it.key ? "page" : undefined}
          >
            <span className="navdot" />
            <span style={{ width: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: 0.85 }}>
              {it.icon}
            </span>
            <span>{it.label}</span>
          </button>
        ))}
      </div>

      <div className="sidenav-footer">
        <span className="sidenav-save-hint">· 已 自 动 存 档 ·</span>
        <SoundSettings />
      </div>
    </nav>
  );
}

/* —— 简洁线性图标(沿用金色描边风格) —— */
function ScrollIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 2.5 H11.5 V13.5 H3 Z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 5 H9.5 M5 7.5 H9.5 M5 10 H8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M11.5 2.5 H13 V12 L12.25 11.2 L11.5 12 Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
function VolumeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="3" y="3" width="10" height="10" stroke="currentColor" strokeWidth="1.2" />
      <rect x="5" y="5" width="6" height="6" stroke="currentColor" strokeWidth="0.9" opacity="0.6" />
      <path d="M6 1 H10 M6 15 H10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function LanternIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1 V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <ellipse cx="8" cy="8" rx="4" ry="5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 4 H11 M5 12 H11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8 13 V15" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
function NodeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="4" cy="4" r="1.8" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="12" cy="8" r="1.8" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="4" cy="12" r="1.8" stroke="currentColor" strokeWidth="1.1" />
      <path d="M5.5 4.6 L10.5 7.4 M10.5 8.6 L5.5 11.4" stroke="currentColor" strokeWidth="1" opacity="0.7" />
    </svg>
  );
}
function SealIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="3" y="3" width="10" height="10" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 6 H10 V10 H6 Z" stroke="currentColor" strokeWidth="1" opacity="0.7" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 3 H8 V13 H3 Z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 3 H13 V13 H8 Z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 6 H7 M5 8 H7 M9.5 6 H11.5 M9.5 8 H11.5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}
function ArchiveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="5" width="11" height="8" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 5 V3 H12 V5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6.5 8.5 H9.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}
