import type { ReactNode } from "react";

interface PageShellProps {
  /** 中文主标题。 */
  title: ReactNode;
  /** 标题上方的英文 eyebrow,如 "VOLUME PROGRESS"。 */
  eyebrow?: string;
  /** 标题下方的中文副标题。 */
  subtitle?: ReactNode;
  /** 返回回调。桌面端不渲染返回键(交由 SideNav),仅移动端显示。 */
  onBack?: () => void;
  /** 顶栏右侧插槽。 */
  right?: ReactNode;
  /** 底部固定区(如 BottomNav 或主操作按钮)。 */
  footer?: ReactNode;
  /** 全屏氛围背景层(铺满整页、置于内容之下,如暗化场景图)。 */
  backdrop?: ReactNode;
  /** 背景类,默认 night-bg。 */
  bg?: string;
  /** 主体是否使用居中阅读带(content-wrap)。默认 true。 */
  wrap?: boolean;
  /** content-wrap 的修饰类,如 "content-wrap--narrow"。 */
  wrapClassName?: string;
  /** 主体内边距,默认 "20px 18px 28px"。 */
  bodyPadding?: string;
  /** 追加到滚动主体的类名(如 scroll-snap 容器)。 */
  bodyClassName?: string;
  children: ReactNode;
}

/**
 * 统一二级页面外壳。纵向 flex:顶栏 + 可滚动主体 + 可选底部固定区,
 * 取代各页手搓的 Topbar + 绝对定位 page-scroll(top/bottom 各异)。
 * 顶栏在桌面端无返回键(SideNav 承担导航),移动端显示返回键。
 */
export function PageShell({
  title, eyebrow, subtitle, onBack, right, footer,
  bg = "night-bg", wrap = true, wrapClassName = "",
  bodyPadding = "20px 18px 28px", bodyClassName = "", backdrop, children,
}: PageShellProps) {
  const body = wrap
    ? <div className={"content-wrap " + wrapClassName}>{children}</div>
    : children;

  return (
    <div className={"page page-shell " + bg}>
      {backdrop && <div className="page-shell-backdrop">{backdrop}</div>}
      <header className="page-head">
        {onBack ? (
          <button
            className="icon-btn press page-head-back"
            data-sfx="back"
            onClick={onBack}
            aria-label="返回"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 1 L3 7 L9 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ) : (
          <span className="page-head-back page-head-back--spacer" aria-hidden="true" />
        )}

        <div className="page-head-titles">
          {eyebrow && <div className="page-head-eyebrow en-small">{eyebrow}</div>}
          <div className="page-head-title title-han">{title}</div>
          {subtitle && <div className="page-head-sub">{subtitle}</div>}
        </div>

        <div className="page-head-right">{right}</div>
      </header>

      <div className={"page-shell-body " + bodyClassName} style={{ padding: bodyPadding }}>
        {body}
      </div>

      {footer && <div className="page-shell-footer">{footer}</div>}
    </div>
  );
}
