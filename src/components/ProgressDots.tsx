interface ProgressDotsProps {
  total: number;
  current: number;
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
  const items: React.ReactNode[] = [];
  for (let i = 0; i < total; i++) {
    const cls = i + 1 === current ? "dot active" : (i + 1 < current ? "dot done" : "dot");
    items.push(<span key={i} className={cls}/>);
  }
  return <div className="progress-dots">{items}</div>;
}
