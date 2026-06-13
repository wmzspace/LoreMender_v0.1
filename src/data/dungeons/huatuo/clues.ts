import type { Clue } from "../../types";

export const CLUES: Clue[] = [
  {
    id: "fragment", name: "青囊残页", icon: "scroll",
    title: "青囊残页 · 卷一·辨脉",
    body: "纸已泛黄，半页字迹被茶渍浸透。\n仅辨得：\n「凡诊脉，先观其神，神在则生……」\n后文残缺，墨痕成花。",
    note: "这是《青囊经》仅存的开篇。",
  },
  {
    id: "prescription", name: "药方抄本", icon: "ledger",
    title: "药方抄本",
    body: "阿吉誊抄的几十张药方。\n字迹潦草，却完整。\n大多是寻常病：风寒、跌打、产后血崩、孩童惊厥。",
    note: "这些方子若散入民间，便是活路。",
  },
  {
    id: "speak", name: "师父口述", icon: "lips",
    title: "师父口述",
    body: "「我这一辈子学的，都在这里了。」\n华佗闭着眼，把口诀一字不落地念完。\n念到一半，他停了下来。",
    note: "活着的人，也能是一本书。",
  },
  {
    id: "ballad", name: "民谣片段", icon: "music",
    title: "市井民谣 · 片段",
    body: "「按三里，止血急；揉合谷，牙疼离。」\n小儿在巷口跳着唱。\n他不知这是医理，只觉调子顺口。",
    note: "歌不识字，却能走万里。",
  },
  {
    id: "needle", name: "施针图", icon: "needle",
    title: "施针图",
    body: "一张人形草图，墨笔点出三十六处穴位。\n每一点旁，小字写着用途与禁忌。\n图角，有华佗的朱印。",
    note: "针法可教，却不必尽传一人。",
  },
];
