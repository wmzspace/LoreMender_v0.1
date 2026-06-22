import { useMemo } from "react";

interface ParticlesProps {
  count?: number;
}

export function Particles({ count = 14 }: ParticlesProps) {
  // 粒子位置/延时/时长一旦定下就不能再变：之前直接在 render 体里跑 Math.random()，
  // 父组件（如 StoryPage）每推进一句对白/弹一次数值卡片都会重渲染，这里就会整片粒子
  // 瞬间换位 → 肉眼可见的「闪烁」。用 useMemo 按 count 固定下来，重渲染不再重算。
  const dots = useMemo(() => {
    const out: React.ReactNode[] = [];
    for (let i = 0; i < count; i++) {
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const delay = (Math.random() * 8).toFixed(2);
      const dur = (8 + Math.random() * 10).toFixed(2);
      const size = (2 + Math.random() * 3).toFixed(1);
      out.push(
        <span key={i} style={{
          left: left + "%", top: top + "%",
          width: size + "px", height: size + "px",
          animationDelay: `-${delay}s`,
          animationDuration: `${dur}s`,
        }}/>
      );
    }
    return out;
  }, [count]);
  return <div className="particles">{dots}</div>;
}
