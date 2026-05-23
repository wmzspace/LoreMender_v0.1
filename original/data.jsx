/* ============================================================
   data.jsx — story, characters, clues, endings, chapters
   Exported to window so other babel scripts can read them.
   ============================================================ */

// ---------- Chapters ----------
const CHAPTERS = [
  { id: "ch1", num: 1, name: "医馆夜谈", brief: "残卷未藏，烛火将尽。" },
  { id: "ch2", num: 2, name: "搜查将至", brief: "门外铁靴渐近，门内书火未明。" },
  { id: "ch3", num: 3, name: "寻找可信之人", brief: "一个人不能带走整本书，也许能带走半句话。" },
  { id: "ch4", num: 4, name: "青囊抉择", brief: "你只剩一次决定。" },
  { id: "ch5", num: 5, name: "余音留世", brief: "书烧了，他死了，可是——" },
];

// ---------- Characters ----------
const CHARACTERS = {
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
  // 第三章 可托付之人
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

const TRUST_OPTIONS = [
  CHARACTERS.disciple,
  CHARACTERS.bonesetter,
  CHARACTERS.singer,
  CHARACTERS.vet,
];

// ---------- Clues ----------
const CLUES = [
  {
    id: "fragment", name: "青囊残页", icon: "scroll",
    title: "青囊残页 · 卷一·辨脉",
    body: "纸已泛黄，半页字迹被茶渍浸透。\n仅辨得：\n「凡诊脉，先观其神，神在则生……」\n后文残缺，墨痕成花。",
    note: "这是《青囊经》仅存的开篇。",
  },
  {
    id: "prescription", name: "药方抄本", icon: "ledger",
    title: "药方抄本",
    body: "徒弟誊抄的几十张药方。\n字迹潦草，却完整。\n大多是寻常病：风寒、跌打、产后血崩、孩童惊厥。",
    note: "这些方子若散入民间，便是活路。",
  },
  {
    id: "speak", name: "徒弟口述", icon: "lips",
    title: "徒弟口述",
    body: "「师父白天讲过的，我都记得。」\n他闭着眼，把师父念过的口诀一字不落地背完。\n背到一半，他哭了。",
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

// ---------- Endings ----------
const ENDINGS = {
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

// ---------- Story script ----------
// Each beat: { speaker, name, line } or { narration, line } or { choices:[{label,next,toast,sets,goto}] } or { goto, scene }
// "scene" is a visual identifier for SceneArt component.
const STORY = {
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
        ]
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
        ]
      },
      { narration: true, line: "门外脚步声越来越近。\n你忽然意识到——能带走的，从来不只是这一本书。" },
      { gotoChapter: "clue" }, // detour to clue page
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
        ]
      },
      { gotoEnding: true },
    ],
  },
};

// ---------- Determine ending ----------
function resolveEnding(state) {
  // finalDecision drives base ending, trustedPerson can upgrade "scatter" to "living"
  const { finalDecision, trustedPerson } = state;
  if (finalDecision === "burn") return "ash";
  if (finalDecision === "seal") return "sealed";
  if (finalDecision === "scatter") {
    // any people-route trust unlocks living ending
    if (["singer", "bonesetter", "vet"].includes(trustedPerson)) return "living";
    if (trustedPerson === "disciple") return "sealed"; // disciple gets caught, becomes sealed/lost
    return "living";
  }
  return "sealed";
}

// Export
Object.assign(window, {
  CHAPTERS, CHARACTERS, TRUST_OPTIONS, CLUES, ENDINGS, STORY,
  resolveEnding,
});
