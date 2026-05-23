import type { Choice } from "../data/types";

interface ChoiceListProps {
  choices: Choice[];
  onChoose: (choice: Choice, index: number) => void;
}

export function ChoiceList({ choices, onChoose }: ChoiceListProps) {
  return (
    <div style={{display:"flex", flexDirection:"column", gap: 10, padding:"12px 14px"}}>
      {choices.map((c, i) => (
        <button key={i} className="choice press" onClick={() => onChoose(c, i)}
                style={{animation: `fadeInUp 350ms ease both ${i*80+50}ms`}}>
          <span className="choice-letter">{String.fromCharCode(65+i)}</span>
          <span>{c.label}</span>
        </button>
      ))}
    </div>
  );
}
