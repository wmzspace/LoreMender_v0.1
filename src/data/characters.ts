import type { Character } from "./types";

export const CHARACTERS: Record<string, Character> = {
  huatuo: {
    id: "huatuo", name: "华佗", role: "神医 · 将死之人",
    desc: "建安年间的名医。青史已写下他的死。",
    accent: "#c9a14a",
  },
  apprentice: {
    id: "apprentice", name: "徒弟", role: "你所附身之人",
    desc: "最不起眼的小徒弟。他怕，但他在。",
    accent: "#a8a07a",
  },
  disciple: {
    id: "disciple", name: "大徒儿 · 吴普",
    role: "侍奉多年的入室弟子", tag: "可托",
    short: "最懂华佗，但可能被牵连。",
    detail: "他记下了师父七成的医理。可官差最先盯上的，也是他。",
    silhouette: "scholar",
  },
  bonesetter: {
    id: "bonesetter", name: "隐村接骨匠 · 老栾",
    role: "山中匠人", tag: "谨慎",
    short: "手艺高超，沉默可靠。",
    detail: "他只接骨，不读书。但他记性极好，听一遍便能照做一辈子。",
    silhouette: "rugged",
  },
  singer: {
    id: "singer", name: "民间歌者 · 阿瑶",
    role: "走街串巷的女说书人", tag: "可信",
    short: "可用歌谣把医理传下去。",
    detail: "她唱过的歌，三里外的孩童都会跟。她说：道理藏在调子里，便不会被烧。",
    silhouette: "songbird",
  },
  vet: {
    id: "vet", name: "兽医 · 老周",
    role: "牲口医人", tag: "仁厚",
    short: "懂生命之理，可把方法用于民间。",
    detail: "他给牛羊接生，也给穷人看病。他说：救马救人，本是一理。",
    silhouette: "elder",
  },
};

export const TRUST_OPTIONS: Character[] = [
  CHARACTERS.disciple,
  CHARACTERS.bonesetter,
  CHARACTERS.singer,
  CHARACTERS.vet,
];
