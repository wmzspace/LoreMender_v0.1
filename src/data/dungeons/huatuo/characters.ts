import type { Character } from "../../types";

export const CHARACTERS: Record<string, Character> = {
  huatuo: {
    id: "huatuo",
    name: "华佗",
    role: "神医 · 将死之人",
    desc: "建安年间的名医。青史已经写下他的死，但医道仍等待归处。",
    accent: "#cdb277",
    portrait: "/images/levels/1/characters/huatuo_square.webp",
  },
  aj: {
    id: "aj",
    name: "阿吉",
    role: "你所附身之人",
    desc: "华佗身边最不起眼的小徒弟。他害怕，却仍要决定《青囊经》的去路。",
    accent: "#a8a07a",
    portrait: "/images/levels/1/characters/aj_square.webp",
  },
  wangji: {
    id: "wangji",
    name: "王济",
    role: "曹府幕僚",
    tag: "制度",
    short: "通文书、懂制度，相信医术入府库才能传远。",
    detail: "王济能保护医书，也可能让医术服从权门。他必须明白制度要先受医德约束。",
    silhouette: "scholar",
    portrait: "/images/levels/1/characters/wangji_square.webp",
  },
  chenbo: {
    id: "chenbo",
    name: "陈伯",
    role: "街市老药工",
    tag: "民间",
    short: "不识全字，却识药多年，乡亲们都信他的手。",
    detail: "陈伯救急稳当，也习惯把验方藏在自己手里。若经验不能整理成人人能懂的药签，传承仍会随人入土。",
    silhouette: "elder",
    portrait: "/images/levels/1/characters/chenbo_square.webp",
  },
  xuanyin: {
    id: "xuanyin",
    name: "玄音",
    role: "民间乐坊歌者",
    tag: "传唱",
    short: "能把医理改成孩童也能记住的曲调。",
    detail: "玄音相信字会被烧、简会被夺，曲子却能藏在人嘴里。她能让知识流动，也必须守住医理边界。",
    silhouette: "songbird",
    portrait: "/images/levels/1/characters/xuanyin_square.webp",
  },
  caocao: {
    id: "caocao",
    name: "曹操",
    role: "魏王",
    tag: "强权",
    short: "他要那本书。",
    detail: "朱漆大堂，青铜灯树。他坐在上方，你站在下方。",
    silhouette: "scholar",
    portrait: "/images/levels/1/characters/caocao_square.webp",
  },
  soldier: {
    id: "soldier",
    name: "士卒",
    role: "曹营兵卒",
    desc: "魏王有请。",
    accent: "#7a8a9a",
  },
};

export const TRUST_OPTIONS: Character[] = [
  CHARACTERS.chenbo,
  CHARACTERS.wangji,
  CHARACTERS.xuanyin,
];
