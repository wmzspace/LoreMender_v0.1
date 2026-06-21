import { LoadingDots } from "./LoadingDots";

/** 启动画面:进游戏先亮工作室 LOGO,趁这段时间在后台把首页封面/视频、典故卷宗每卷封面/视频加载完。
 *  加载中显示「典 故 记 载 中…」;素材就绪后切到「点 击 屏 幕 继 续」(带呼吸闪烁),等玩家点一下再退场。 */
export function BootScreen({ exiting, ready, onContinue }: {
  exiting?: boolean;
  ready?: boolean;
  onContinue?: () => void;
}) {
  return (
    <div
      className={"boot-screen" + (exiting ? " is-exiting" : "") + (ready ? " is-ready" : "")}
      onClick={ready ? onContinue : undefined}
      role={ready ? "button" : undefined}
      aria-label={ready ? "点击屏幕继续" : undefined}
    >
      <img className="boot-screen-logo" src="/images/logo_studio.webp" alt="拾遗工作室" />
      <div className="boot-screen-sub">出 品</div>
      {ready ? (
        <div className="boot-screen-continue">点 击 屏 幕 继 续</div>
      ) : (
        <div className="boot-screen-loading">典 故 记 载 中<LoadingDots /></div>
      )}
    </div>
  );
}
