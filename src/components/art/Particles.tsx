interface ParticlesProps {
  count?: number;
}

export function Particles({ count = 14 }: ParticlesProps) {
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const delay = (Math.random() * 8).toFixed(2);
    const dur = (8 + Math.random() * 10).toFixed(2);
    const size = (2 + Math.random() * 3).toFixed(1);
    dots.push(
      <span key={i} style={{
        left: left + "%", top: top + "%",
        width: size + "px", height: size + "px",
        animationDelay: `-${delay}s`,
        animationDuration: `${dur}s`,
      }}/>
    );
  }
  return <div className="particles">{dots}</div>;
}
