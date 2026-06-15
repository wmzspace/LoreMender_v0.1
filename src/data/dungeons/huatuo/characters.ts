import type { Character } from "../../types";

export const CHARACTERS: Record<string, Character> = {
  huatuo: {
    id: "huatuo", name: "华佗", role: "神医 · 将死之人",
    desc: "建安年间的名医。青史已写下他的死。",
    accent: "#cdb277",
    portrait: "/images/levels/1/characters/huatuo_square.webp",
  },
  aj: {
    id: "aj", name: "阿吉", role: "你所附身之人",
    desc: "华佗身边最不起眼的小徒弟。他怕，但他在。",
    accent: "#a8a07a",
    portrait: "/images/levels/1/characters/aj_square.webp",
  },
  wangji: {
    id: "wangji", name: "王济",
    role: "曹营门客", tag: "危险",
    short: "在曹营说得上话，但眼神游移。",
    detail: "他说能保医书周全，眼神却不敢直视你。曹营的庇护，未必是庇护。",
    silhouette: "scholar",
    portrait: "/images/levels/1/characters/wangji_square.webp",
  },
  chenbo: {
    id: "chenbo", name: "陈伯",
    role: "乡野郎中", tag: "真心",
    short: "大字不识，但乡亲们信他。",
    detail: "鞋上沾满泥土，怀里揣着草药。他不读书，却真的在救人。",
    silhouette: "elder",
    portrait: "/images/levels/1/characters/chenbo_square.webp",
  },
  xuanyin: {
    id: "xuanyin", name: "玄音道人",
    role: "山中道士", tag: "超脱",
    short: "藏于深山，百年后或有缘法。",
    detail: "衣袂飘飘，眼神高远。医书入山，或许能躲过战火——但也可能永远不见天日。",
    silhouette: "rugged",
    portrait: "/images/levels/1/characters/xuanyin_square.webp",
  },
  caocao: {
    id: "caocao", name: "曹操",
    role: "魏王", tag: "强权",
    short: "他要那本书。",
    detail: "朱漆大堂，青铜灯树。他坐在上方，你站在下方。",
    silhouette: "scholar",
    portrait: "/images/levels/1/characters/caocao_square.webp",
  },
  soldier: {
    id: "soldier", name: "士卒",
    role: "曹营兵卒",
    desc: "魏王有请。",
    accent: "#7a8a9a",
  },
};

/** 第四章托付候选人 */
export const TRUST_OPTIONS: Character[] = [
  CHARACTERS.wangji,
  CHARACTERS.chenbo,
  CHARACTERS.xuanyin,
];
