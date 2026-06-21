import { LoadingDots } from "./LoadingDots";

/** 启动画面:进游戏先亮工作室 LOGO,趁这段时间在后台把首页封面/视频、典故卷宗每卷封面/视频加载完。 */
export function BootScreen({ exiting }: { exiting?: boolean }) {
  return (
    <div className={"boot-screen" + (exiting ? " is-exiting" : "")}>
      <img className="boot-screen-logo" src="/images/logo_studio.webp" alt="拾遗工作室" />
      <div className="boot-screen-sub">出 品</div>
      <div className="boot-screen-loading">典 故 记 载 中<LoadingDots /></div>
    </div>
  );
}
