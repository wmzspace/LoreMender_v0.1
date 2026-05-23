import type { Ending, EndingId, GameState } from "./types";

export const ENDINGS: Record<EndingId, Ending> = {
  ash: {
    id: "ash", name: "原卷成灰", rank: "遗憾未竟", rankColor: "#8a3a2a",
    epitaph: "火光吞没了残卷。",
    body: "火光吞没了残卷。\n\n华佗没有阻止你。他只是很久没有说话。\n\n后来，世人只记得他医术通神，却再也不知道他究竟如何救人。",
    glyph: "fire",
  },
  sealed: {
    id: "sealed", name: "密室封存", rank: "遗憾半修", rankColor: "#6b5a2a",
    epitaph: "墙合上的那一刻，灰尘落了三百年。",
    body: "残卷被藏在无人知晓的夹墙里。\n\n它躲过了搜查，也躲过了后世。\n\n很多年后，墙体坍塌，纸页已碎成尘。",
    glyph: "wall",
  },
  living: {
    id: "living", name: "医道未断", rank: "医道未断", rankColor: "#3a6b58",
    epitaph: "书没有留下，医道留下了。",
    body: "没有人再见过完整的《青囊经》。\n\n可许多年后，乡野间有接骨匠会唱奇怪的口诀，兽医懂得止血，老妇人知道按哪个穴位能救急。\n\n书没有留下，医道留下了。\n\n——华佗终究死了。可这一次，医道没有随他一起沉入青史。",
    glyph: "shoots",
  },
};

export function resolveEnding(state: GameState): EndingId {
  const { finalDecision, trustedPerson } = state;
  if (finalDecision === "burn") return "ash";
  if (finalDecision === "seal") return "sealed";
  if (finalDecision === "scatter") {
    if (trustedPerson && ["singer", "bonesetter", "vet"].includes(trustedPerson)) return "living";
    if (trustedPerson === "disciple") return "sealed";
    return "living";
  }
  return "sealed";
}
