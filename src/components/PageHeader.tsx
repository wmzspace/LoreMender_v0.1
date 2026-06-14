import type { ReactNode } from "react";

interface PageHeaderProps {
  /** Small EN caps line, e.g. "LORE · CODEX". */
  eyebrow?: string;
  /** 中文标题,e.g. "典 籍 设 定"。 */
  title?: string;
  /** 引导语/副文案,可多行。 */
  intro?: ReactNode;
}

/**
 * Consistent in-page header used across the codex-style screens
 * (World / Clue / Gallery / Trust). Keeps the eyebrow → title → hairline →
 * intro rhythm identical everywhere instead of each page hand-rolling it.
 */
export function PageHeader({ eyebrow, title, intro }: PageHeaderProps) {
  return (
    <div className="fade-in" style={{ textAlign: "center", margin: "2px 0 16px" }}>
      {eyebrow && (
        <div className="en-small" style={{
          fontSize: 10, letterSpacing: "0.34em",
          color: "var(--gold-pale)", opacity: 0.6,
        }}>{eyebrow}</div>
      )}
      {title && (
        <div className="title-han" style={{
          fontSize: 22, color: "var(--gold-pale)", marginTop: 7,
          letterSpacing: "0.3em", textIndent: "0.3em",
          textShadow: "0 0 14px rgba(231,199,115,0.25)",
        }}>{title}</div>
      )}
      {title && (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 9 }}>
          <span style={{
            width: 40, height: 1,
            background: "linear-gradient(90deg, transparent, var(--gold-pale), transparent)",
          }} />
        </div>
      )}
      {intro && (
        <div style={{
          fontSize: 12.5, lineHeight: 1.75, opacity: 0.8,
          color: "rgba(231,217,179,0.88)", letterSpacing: "0.05em",
          marginTop: title ? 12 : 8,
          maxWidth: 300, marginLeft: "auto", marginRight: "auto",
        }}>{intro}</div>
      )}
    </div>
  );
}
