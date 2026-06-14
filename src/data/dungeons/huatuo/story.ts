import type { StoryChapter } from "../../types";

export const STORY: Record<string, StoryChapter> = {
  // 第一章 · 牢狱初醒
  ch1: {
    scene: "xuchang_prison",
    title: "第一章 · 牢狱初醒",
    beats: [
      { narration: true, line: "建安十三年，许昌大牢。\n黑暗中，一只手在枯草中摸索。" },
      { speaker: "aj", line: "（这里是……？头好痛……）" },
      { narration: true, line: "阿吉缓缓睁开眼。烛火摇曳中，他看见隔壁囚室里一个苍老的身影。" },
      { speaker: "huatuo", line: "醒了？\n过来，帮我把那些竹简拼好。天亮之前，得做完这件事。" },
      { speaker: "aj", line: "师父……这写的是什么？" },
      { speaker: "huatuo", line: "《青囊经》。我这一辈子的东西。\n但今夜过后，它能不能留下，要看你了。" },
      {
        choices: [
          { label: "师父放心，我一定保护好它。", toast: "华佗微微点头，眼中有一丝欣慰。", set: { trust_huatuo: "20", firstImpression: "loyal" } },
          { label: "徒儿愚钝，怕辜负师父。", toast: "华佗轻叹一声，眼神复杂。", set: { trust_huatuo: "10", firstImpression: "humble" } },
          { label: "先拼竹简，别的再说。", toast: "你低头开始拼合散落的竹简。", set: { trust_huatuo: "5", firstImpression: "cautious" } },
        ],
      },
      { speaker: "huatuo", line: "你听着。我若出事，这书必须托付给对的人。\n明日，你替我去见三个人。" },
      { gotoChapter: "ch2" },
    ],
  },

  // 第二章 · 三人之试
  ch2: {
    scene: "three_places",
    title: "第二章 · 三人之试",
    beats: [
      { narration: true, line: "天亮后，阿吉走出医馆。\n华佗说，三个徒弟中，只有一个值得托付。" },
      { narration: true, line: "你先后见到了三个人……" },
      { speaker: "wangji", line: "师弟？师父的书？交给我就好。我在曹营说得上话，能保它周全。" },
      { narration: true, line: "（王济眼神游移，不敢直视你。）" },
      { speaker: "chenbo", line: "我？我大字不识一个，就会给人看个头疼脑热。\n不过……乡亲们说我的方子管用。" },
      { narration: true, line: "（陈伯鞋上沾满泥土，怀里揣着几味草药。）" },
      { speaker: "xuanyin", line: "《青囊经》？\n深山藏之，百年后自有缘法。凡尘俗世，不配拥有它。" },
      { narration: true, line: "（玄音道人衣袂飘飘，眼神高远。）" },
      {
        choices: [
          { label: "王济最可靠，他有曹营背景。", toast: "你记下了王济的信息。", set: { found_clue: "wangji_trap", suspect: "wangji" } },
          { label: "陈伯最朴素，他真心在救人。", toast: "你触碰到了这段典故真正的遗憾。", set: { found_clue: "chenbo_true", suspect: "chenbo" } },
          { label: "玄音道人最超脱，藏于山林最安全。", toast: "你记下了玄音道人的话。", set: { found_clue: "xuanyin_fallback", suspect: "xuanyin" } },
        ],
      },
      { narration: true, line: "夜幕降临。你必须回去告诉华佗，你的判断。" },
      { gotoChapter: "ch3" },
    ],
  },

  // 第三章 · 曹府密谈
  ch3: {
    scene: "cao_mansion",
    title: "第三章 · 曹府密谈",
    beats: [
      { narration: true, line: "你尚未回到牢中，一队士卒将你拦下。" },
      { speaker: "soldier", line: "魏王有请。" },
      { narration: true, line: "朱漆大堂。青铜灯树。\n曹操坐在上方，案上放着一卷竹简。" },
      { speaker: "caocao", line: "华佗的徒弟？\n听说，你师父写了一本书。" },
      { speaker: "aj", line: "……是。" },
      { speaker: "caocao", line: "交出来。本王保你师徒平安。\n否则……你知道后果。" },
      {
        choices: [
          { label: "沉默不语，不接话。", toast: "曹操眯起眼睛，玩味地看着你。", set: { cao_suspicion: "10", caoCunning: "silence" } },
          { label: "推说不知，拖延时间。", toast: "曹操敲了敲案几，面露不耐。", set: { cao_suspicion: "20", caoCunning: "delay" } },
          { label: "虚与委蛇，假意答应。", toast: "曹操笑了，命人给你倒酒。", set: { cao_suspicion: "30", caoCunning: "pretend" } },
        ],
      },
      { speaker: "caocao", line: "有意思。\n三天。三天后，我要看到那本书。" },
      { narration: true, line: "你被押回牢中。华佗还在等你。" },
      { gotoChapter: "ch4" },
    ],
  },

  // 第四章 · 青囊抉择
  ch4: {
    scene: "huatuo_cell",
    title: "第四章 · 青囊抉择",
    beats: [
      { narration: true, line: "深夜。蜡烛快要燃尽了。\n华佗靠在墙上，看着你。" },
      { speaker: "huatuo", line: "见到了？\n你觉得，该给谁？" },
      { narration: true, line: "你张了张嘴，却说出另一个判断……" },
      { gotoTrust: true },
      { speaker: "huatuo", line: "……是吗。\n你既已决意，我便随你。我已经太老了。" },
      { gotoEnding: true },
    ],
  },
};
