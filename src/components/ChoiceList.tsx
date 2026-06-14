import type { CSSProperties } from "react";
import type { Choice } from "../data/types";

// 甲乙丙丁… — classical ordinals for enumerated options, in place of A/B/C/D.
const ORDINALS = ["甲", "乙", "丙", "丁", "戊"];

// each card sits at its own slight angle, like separate notes laid on a desk
// rather than a machined list — kept under a degree so it reads as "placed", not "broken".
const CARD_TILTS = [-0.7, 0.6, -0.5, 0.7, -0.6];

interface ChoiceListProps {
  choices: Choice[];
  onChoose: (choice: Choice, index: number) => void;
}

export function ChoiceList({ choices, onChoose }: ChoiceListProps) {
  return (
    <div style={{display:"flex", flexDirection:"column", gap: 18, padding:"12px 14px"}}>
      {choices.map((c, i) => {
        const mark = ORDINALS[i] ?? String(i+1);
        const sealTilt = i % 2 === 0 ? -5 : 4;
        const cardTilt = CARD_TILTS[i % CARD_TILTS.length];
        return (
          <button key={i} className="choice press" onClick={() => onChoose(c, i)}
                  style={{
                    animation: `choiceIn 380ms ease both ${i*80+60}ms`,
                    "--tilt": `${cardTilt}deg`,
                  } as CSSProperties}>
            <span className="choice-letter" style={{transform: `rotate(${sealTilt}deg)`}}>{mark}</span>
            <span className="choice-mark" aria-hidden="true">{mark}</span>
            <span className="choice-label">{c.label}</span>
          </button>
        );
      })}
    </div>
  );
}
