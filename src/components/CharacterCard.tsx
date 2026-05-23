import type { Character } from "../data/types";
import { CharSilhouette } from "./art";
import { SealTag } from "./SealTag";

interface CharacterCardProps {
  char: Character;
  selected: boolean;
  onSelect: () => void;
}

export function CharacterCard({ char, selected, onSelect }: CharacterCardProps) {
  return (
    <button onClick={onSelect}
      className="press"
      style={{
        position: "relative",
        textAlign: "left", cursor: "pointer",
        background: selected
          ? "linear-gradient(180deg, rgba(231,199,115,0.18), rgba(40,30,18,0.7))"
          : "linear-gradient(180deg, rgba(30,22,14,0.9), rgba(15,10,6,0.9))",
        border: "1px solid " + (selected ? "var(--gold-pale)" : "rgba(201,161,74,0.35)"),
        borderRadius: 2,
        padding: 0,
        overflow: "hidden",
        boxShadow: selected
          ? "0 0 0 1px var(--gold-pale), 0 0 32px rgba(231,199,115,0.25)"
          : "0 4px 16px rgba(0,0,0,0.5)",
        color: "var(--paper)",
        transition: "all 220ms",
      }}>
      <div style={{position:"relative", height: 130, background:"#0a0604", overflow:"hidden"}}>
        {char.silhouette && (
          <CharSilhouette kind={char.silhouette} accent={selected ? "#e7c773" : "#8c6b29"}/>
        )}
        <div style={{position:"absolute", top:8, right:8}}>
          <SealTag size="sm">{char.tag}</SealTag>
        </div>
      </div>
      <div style={{padding: "10px 12px 12px"}}>
        <div style={{
          fontFamily: "ZCOOL XiaoWei, serif", fontSize: 15,
          letterSpacing: "0.16em",
          color: selected ? "var(--gold-pale)" : "var(--paper)",
        }}>{char.name}</div>
        <div style={{fontSize: 11, opacity: 0.7, marginTop: 3, letterSpacing: "0.1em"}}>
          {char.role}
        </div>
        <div style={{
          fontSize: 12.5, opacity: 0.85, marginTop: 8, lineHeight: 1.55,
          color: "rgba(231,217,179,0.85)",
        }}>{char.short}</div>
      </div>
      {selected && (
        <div style={{
          position:"absolute", inset: 0, pointerEvents:"none",
          boxShadow:"inset 0 0 30px rgba(231,199,115,0.15)",
        }}/>
      )}
    </button>
  );
}
