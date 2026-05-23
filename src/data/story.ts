import type { StoryChapter } from "./types";

export const STORY: Record<string, StoryChapter> = {
  ch1: {
    scene: "clinic_night",
    title: "第一章 · 医馆夜谈",
    beats: [
      { narration: true, line: "夜雨初停。建安二十年，许都狱外的一间小医馆。\n烛火三盏，药柜七格。残卷一页。" },
      { speaker: "huatuo", line: "你来了。\n替我把那卷东西收一收——别让灯油溅上去。" },
      { speaker: "apprentice", line: "（这是……《青囊经》？)" },
      { speaker: "huatuo", line: "若医术落入恶人之手，救人之法，也会变成杀人之术。\n你说，这书该留吗？" },
      {
        choices: [
          { label: "医术无罪。该留给值得信任的人。", toast: "你触碰到了这段典故真正的遗憾。", set: { firstChoice: "trust" } },
          { label: "若会害人，不如毁掉。", toast: "华佗看了你一眼，没有说话。", set: { firstChoice: "burn" } },
          { label: "不能现在决定，先弄清真相。", toast: "你获得了关键线索：青囊残页", set: { firstChoice: "investigate" } },
        ],
      },
      { speaker: "huatuo", line: "也好。\n你去翻翻药柜后面那只木匣，再过来与我说话。\n——我怕，今夜没有明天。" },
      { gotoChapter: "ch2" },
    ],
  },
  ch2: {
    scene: "raid_coming",
    title: "第二章 · 搜查将至",
    beats: [
      { narration: true, line: "三更。\n远处巷口，铁靴踏过石板，由远及近。" },
      { speaker: "apprentice", line: "（不能再等了。）" },
      { speaker: "huatuo", line: "他们若搜到这本书，便要再砍我一次。\n你说，怎么办？" },
      {
        choices: [
          { label: "藏起残卷。", toast: "你把残卷塞进药柜暗格。", set: { ch2: "hide" } },
          { label: "追问华佗徒弟，他记得多少。", toast: "你触碰到了这段典故真正的遗憾。", set: { ch2: "ask" } },
          { label: "去市井寻找传闻。", toast: "你听见巷口孩童在唱奇怪的歌谣。", set: { ch2: "street" } },
        ],
      },
      { narration: true, line: "门外脚步声越来越近。\n你忽然意识到——能带走的，从来不只是这一本书。" },
      { gotoChapter: "clue" },
    ],
  },
  ch3: {
    scene: "find_trust",
    title: "第三章 · 寻找可信之人",
    beats: [
      { narration: true, line: "四更。雨又下了起来。\n华佗指了指门外。" },
      { speaker: "huatuo", line: "若有一夜，只能托付一人——\n你想把它，交给谁？" },
      { gotoTrust: true },
    ],
  },
  ch4: {
    scene: "final_choice",
    title: "第四章 · 青囊抉择",
    beats: [
      { narration: true, line: "五更将至。\n你把那卷书捧在手里。它比想象中轻。" },
      { speaker: "huatuo", line: "做吧。\n我已经太老，做不了这件事了。" },
      {
        choices: [
          { label: "毁去原卷，以绝后患。", toast: "你点燃了烛芯。", set: { finalDecision: "burn" }, ending: "ash" },
          { label: "藏于民间，散于有缘。", toast: "你把方子撕成几份，分别塞进衣襟。", set: { finalDecision: "scatter" }, ending: "living" },
          { label: "暂且封存，待后来人。", toast: "你将残卷裹紧，塞进药柜夹墙。", set: { finalDecision: "seal" }, ending: "sealed" },
        ],
      },
      { gotoEnding: true },
    ],
  },
};
