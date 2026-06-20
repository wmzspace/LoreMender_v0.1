import type { StoryChapter } from "../../types";

export const STORY: Record<string, StoryChapter> = {
  ch1: {
    scene: "xuchang_prison",
    title: "许昌大牢",
    fullTitle: "第一章 · 许昌大牢 · 青囊残术",
    images: {
      8: "/images/levels/1/chapters/ch1_beats/ch1_08_box_success.webp",
      10: "/images/levels/1/chapters/ch1_beats/ch1_09_box_failure.webp",
      11: "/images/levels/1/chapters/ch1_beats/ch1_05_box_key_hint.webp",
      13: "/images/levels/1/chapters/ch1_beats/ch1_10_guard_checks_box.webp",
      19: "/images/levels/1/chapters/ch1_beats/ch1_11_escape_side_gate.webp",
    },
    gameImages: {
      5: "/images/levels/1/chapters/ch1_beats/ch1_04_scattered_bamboo.webp",
      10: "/images/levels/1/chapters/ch1_beats/ch1_05_box_key_hint.webp",
    },
    beats: [
      { narration: true, line: "建安十三年，许昌大牢。黑暗中，阿吉从草席旁醒来。", image: "/images/levels/1/chapters/ch1_beats/ch1_01_wake_cell.webp" },
      { speaker: "aj", line: "这里是……" },
      { speaker: "aj", line: "师父？", image: "/images/levels/1/chapters/ch1_beats/ch1_02_huatuo_scattered_slips.webp" },
      { speaker: "huatuo", line: "没时间解释。先把地上的东西捡起来。" },
      {
        explore: {
          hint: "牢房里仍有能救下青囊残术的东西。先查看每一处可疑之物。",
          image: "/images/levels/1/chapters/ch1_beats/ch1_explore_cell.webp",
          hotspots: [
            {
              id: "aj",
              label: "阿吉",
              x: 26,
              y: 36,
              image: "/images/levels/1/chapters/ch1_beats/ch1_03_cloth_strip.webp",
              beats: [
                { narration: true, line: "你低头打量自己：粗布囚衣，腕上勒痕未褪，袖口却还藏着一段破布条。" },
                { speaker: "aj", line: "这具身体……是阿吉。二十六七岁，师父门下最小的弟子。" },
                { narration: true, line: "获得：破布条。它可以临时捆扎残页，也能在搜身时作一点补救。" },
              ],
            },
            {
              id: "huatuo",
              label: "华佗",
              x: 78,
              y: 30,
              image: "/images/levels/1/chapters/ch1_beats/ch1_02_huatuo_scattered_slips.webp",
              beats: [
                { speaker: "huatuo", line: "看我做什么？我这条命已经不在你手里了。" },
                { speaker: "aj", line: "可我不知道该救什么。" },
                { speaker: "huatuo", line: "那就先救这些字。字若还在，人后来才有路。竹简少一片，后面就会错一分。" },
              ],
            },
            {
              id: "bamboo",
              label: "散落竹简",
              x: 67,
              y: 67,
              image: "/images/levels/1/chapters/ch1_beats/ch1_04_scattered_bamboo.webp",
              beats: [
                { narration: true, line: "牢门边散落着断裂竹简，墨迹被血与潮气洇开。病症、医理、药方混在一处。" },
                { speaker: "aj", line: "地上这些……是《青囊经》？" },
                { speaker: "huatuo", line: "是它剩下来的样子。书散了，人也快散了。你先别哭，先拾。" },
              ],
            },
            {
              id: "box",
              label: "木盒",
              x: 52,
              y: 72,
              image: "/images/levels/1/chapters/ch1_beats/ch1_05_box_key_hint.webp",
              beats: [
                { speaker: "aj", line: "这个盒子锁住了。" },
                { speaker: "huatuo", line: "锁住的未必是宝贝，也可能是一条生路。钥匙不在盒旁，去最不起眼的地方找。" },
              ],
            },
            {
              id: "straw",
              label: "墙角稻草",
              x: 12,
              y: 78,
              image: "/images/levels/1/chapters/ch1_beats/ch1_06_straw_key.webp",
              beats: [
                { narration: true, line: "墙角稻草湿冷发霉。你在最底下摸到一枚生锈铜钥匙。" },
                { narration: true, line: "获得：生锈铜钥匙。" },
              ],
            },
            {
              id: "coat",
              label: "药童衣包",
              x: 36,
              y: 79,
              image: "/images/levels/1/chapters/ch1_beats/ch1_07_healer_bundle_pass.webp",
              beats: [
                { speaker: "aj", line: "这是我从前送药穿的衣服……还有半张路引。" },
                { speaker: "huatuo", line: "狱卒认不全人，只认差事。你若想走出去，就得先像一个还能被差遣的人。" },
                { narration: true, line: "获得：旧药童衣、半张路引。路引还缺华佗印记，暂时不能用。" },
              ],
            },
            {
              id: "door",
              label: "牢门",
              x: 88,
              y: 58,
              image: "/images/levels/1/chapters/ch1_beats/ch1_11_escape_side_gate.webp",
              beats: [
                { narration: true, line: "牢门从外面锁着。铁链拖在地上，天亮前会有人来点验。" },
                { speaker: "aj", line: "要离开这里，不能只靠跑。" },
              ],
            },
          ],
        },
      },
      {
        game: {
          id: "bamboo_puzzle",
          name: "竹简收集与拼合",
          kind: "bambooPuzzle",
          unlockItem: "qingsang_fragment",
          nextBeatUnlocked: "竹简被归入病症、医理、药方三组。残页仍有缺口，却终于能读出一条活路。",
          nextBeatUnlockedImage: "/images/levels/1/chapters/ch1_beats/bamboo_table_finished.webp",
          context: "在牢房中找出散落竹简，并把它们归入病症、医理、药方三组。拼起的不是完整答案，而是青囊残术继续被验证的资格。",
          reward: { item: "qingsang_fragment", skill: "medical_skill" },
        },
        image: "/images/levels/1/chapters/ch1_beats/bamboo_table.webp"
      },
      { speaker: "aj", line: "拼好了，可还是缺。", image: "/images/levels/1/chapters/ch1_beats/bamboo_table_finished.webp" },
      { speaker: "huatuo", line: "本来就缺。世上没有一卷书能替人把路走完。" },
      { speaker: "aj", line: "那你还让我带它走？" },
      { speaker: "huatuo", line: "因为缺的地方，要你一路去补。" },
      {
        choices: [
          { label: "「先带它出去再说，活命要紧。」", set: { huatuo_trust: -1 }, toast: "华佗看了你一眼，没有说话。" },
          { label: "「我不只想带它走，也想学您救人的法子。」", set: { huatuo_trust: 1, medical_skill: 1 }, toast: "华佗对你的选择感到欣慰" },
        ],
      },
      {
        game: {
          id: "wooden_box",
          name: "木盒机关与藏匿",
          kind: "woodenBox",
          unlockItem: "travel_pass",
          requiredItem: "qingsang_fragment",
          nextBeatUnlocked: "木盒暗格合上，残页暂时藏住。半张路引也补上华佗印记，补成药童路引，足以骗过牢门。",
          nextBeatUnlockedImage: "/images/levels/1/chapters/ch1_beats/woodenbox_table_finished.webp",
          context: "用生锈铜钥匙解开木盒机关，再把青囊残页藏入夹层，补全药童路引。藏得越稳，后续追索压力越低。",
          reward: { item: "travel_pass", skill: "asked_heart" },
        },
        image: "/images/levels/1/chapters/ch1_beats/ch1_05_box_key_hint.webp"
      },

      {
        ifKey: "boxCompartment",
        ifVal: "found",
        beats: [
          { speaker: "aj", line: "师父，我把它藏好了。", image: "/images/levels/1/chapters/ch1_beats/ch1_08_box_success.webp" },
          { speaker: "huatuo", line: "不是藏好了，是暂时没死。", image: "/images/levels/1/chapters/ch1_beats/ch1_17_huatuo_warns_trust_hate.webp" },
        ],

      },
      {
        ifKey: "boxCompartment",
        ifVal: "missed",
        beats: [
          { narration: true, line: "夹层合得不够稳。华佗咳血引开狱卒，阿吉仍能离开，但木盒在搜身时险些露馅。", image: "/images/levels/1/chapters/ch1_beats/ch1_10_guard_checks_box.webp" },
        ],
      },
      { speaker: "aj", line: "我会把它交给可靠的人。", image: "/images/levels/1/chapters/ch1_beats/ch1_17_huatuo_warns_trust_hate.webp" },
      { speaker: "huatuo", line: "别急着说可靠。看他怎么救人，怎么看穷人，怎么对待错字，再决定。" },
      {
        choices: [
          { label: "「我会照您说的，先看人怎么对待错字。」", set: { huatuo_trust: 1 }, toast: "你把这句叮嘱记进了心里。" },
          { label: "「我自有分寸。」", set: { huatuo_trust: -1 } },
        ],
      },
      { speaker: "guard", line: "送药的？这么晚还出去？", image: "/images/levels/1/chapters/ch1_beats/ch1_16_chains_soldier_arrives.webp" },
      { speaker: "aj", line: "曹府要的退热药，误了时辰，小的担不起。" },
      { speaker: "guard", line: "低头。盒子打开。", image: "/images/levels/1/chapters/ch1_beats/ch1_18_body_search_tension.webp" },
      { speaker: "aj", line: "里面是空盒，装药包用的。" },
      { speaker: "guard", line: "快点走，天亮前别让我再看见你。", image: "/images/levels/1/chapters/ch1_beats/ch1_19_aji_understands_inheritance.webp" },
      { speaker: "huatuo", line: "阿吉。路引只能骗过门，骗不过你自己的心。出去以后，每一步都算数。" },
      {
        choices: [
          { label: "（沉默不语，转身离开）", set: { huatuo_trust: -1 } },
          { label: "「师父，这句话我记下了。」（点头默记华佗的话）", set: { huatuo_trust: 1, asked_heart: 1 }, toast: "华佗的话，被你一字不漏地记下。" },
        ],
      },
      { narration: true, line: "阿吉穿着旧药童衣，拿着华佗补过印的药童路引，从送药小门离开大牢。曹府暂时还以为残卷留在牢中；等点验发现木盒空响，追索才会开始。" },
      { gotoChapter: "ch2" },
    ],
  },

  ch2: {
    scene: "street_market",
    title: "许昌街市",
    fullTitle: "第二章 · 许昌街市 · 陈伯与民间验方",
    images: {
      0: "/images/levels/1/chapters/ch2_beats/beat00_dawn_shop.webp",
      1: "/images/levels/1/chapters/ch2_beats/beat01_child_fever.webp",
      4: "/images/levels/1/chapters/ch2_beats/beat04_chenbo_stall.webp",
      6: "/images/levels/1/chapters/ch2_beats/beat06_chenbo_steady.webp",
      9: "/images/levels/1/chapters/ch2_beats/beat09_sniff_herbs.webp",
      14: "/images/levels/1/chapters/ch2_beats/beat14_slips_to_aji.webp",
      20: "/images/levels/1/chapters/ch2_beats/beat20_half_song.webp",
    },
    beats: [
      { narration: true, line: "天色刚亮，许昌街市已经乱成一团。曹府征药的告示贴在墙上，药摊翻倒，药包滚进泥水里。", image: "/images/levels/1/chapters/ch2_beats/ch2_1_dawn_xuchang_escort_market.webp" },
      { speaker: "woman", line: "谁来看看我孩子？他刚才还会哭，现在连哭声都没了！", image: "/images/levels/1/chapters/ch2_beats/ch2_2_half_song_aji_stops.webp" },
      { speaker: "passerby", line: "曹府征药，药摊都被翻了，谁还有空管一个孩子？", image: "/images/levels/1/chapters/ch2_beats/ch2_3_.webp" },
      { speaker: "aj", line: "让一让，我看看。" },
      { speaker: "woman", line: "你是大夫？" },
      { speaker: "aj", line: "不是大夫。只是……跟着大夫学过一点。" },
      {
        explore: {
          hint: "街市急症不是听方子就能治。先查看孩子、药炉和药包，收集足够线索。",
          image: "/images/levels/1/chapters/ch2_beats/beat00_dawn_shop.webp",
          hotspots: [
            {
              id: "child",
              label: "孩童",
              x: 49,
              y: 54,
              beats: [
                { speaker: "aj", line: "额头烫，牙关紧，眼神散。" },
                { narration: true, line: "获得线索：高热抽搐。" },
              ],
            },
            {
              id: "palm",
              label: "孩童手掌",
              x: 57,
              y: 67,
              beats: [
                { speaker: "aj", line: "手脚却冷。不是单纯发热。" },
                { narration: true, line: "获得线索：手脚发冷。" },
              ],
            },
            {
              id: "stove",
              label: "药炉",
              x: 72,
              y: 70,
              beats: [
                { speaker: "aj", line: "炉底还有热灰，刚煎过药。" },
                { speaker: "chenbo", line: "那锅药不是我开的。退热药下重了，孩子受不住。" },
                { narration: true, line: "获得线索：刚煎过退热药，但剂量混乱。" },
              ],
            },
            {
              id: "packet",
              label: "翻倒药包",
              x: 28,
              y: 75,
              beats: [
                { narration: true, line: "泥水里混着药材残渣，气味辛散。阿吉把能辨认的几味捡了出来。" },
                { narration: true, line: "获得：药材残渣。" },
              ],
            },
            {
              id: "notice",
              label: "征药告示",
              x: 18,
              y: 29,
              beats: [
                { narration: true, line: "曹府征药令写得很急。药材被控制，民间救急会越来越难。" },
                { narration: true, line: "追索压力上升：曹府开始控制药材。" },
              ],
            },
            {
              id: "chenbo",
              label: "陈伯",
              x: 76,
              y: 43,
              beats: [
                { speaker: "chenbo", line: "小先生，你看得太慢，孩子可等不了。" },
                { speaker: "aj", line: "你知道该怎么救？" },
                { speaker: "chenbo", line: "知道一点。但你若只想听我报方子，就别碰那孩子。方子离了症状，就是刀子。" },
              ],
            },
          ],
        },
      },
      { speaker: "aj", line: "高热，抽搐，手脚冷，刚用过重退热药。" },
      { speaker: "chenbo", line: "这才像华先生门下出来的人。现在说，你敢不敢配？" },
      { speaker: "aj", line: "我敢试，但你要在旁边看着。" },
      { speaker: "chenbo", line: "我看着。错了，我骂你；对了，我把药签给你。" },
      {
        choices: [
          { label: "「你直接报方子最快，少废话。」", set: { chenbo_trust: -1 } },
          { label: "「我先把孩子的症状看清，再动手，不抢着报方子。」", set: { chenbo_trust: 1, medical_skill: 1 }, toast: "陈伯点了点头。" },
        ],
      },
      {
        game: {
          id: "herb_memory",
          name: "配药救急",
          kind: "herbMemory",
          unlockItem: "chenbo_prescription",
          nextBeatUnlocked: "孩子的呼吸重新稳住。陈伯把药签塞给阿吉，药方第一次有了离开一双手的可能。",
          context: "根据高热抽搐、手脚发冷、退热药过重和药材残渣判断救急方向。药签越完整，民间经验越可能变成旁人也能用的东西。",
          reward: { item: "chenbo_prescription", skill: "chenbo_trust" },
        },
      },
      {
        choices: [
          { label: "只请陈伯口述方子，先记在心里", set: { ch2: "oral_only", record_tendency: 1 }, toast: "陈伯信任尚可，但记录倾向不足。" },
          { label: "把药签整理成旁人能看懂的样子", set: { ch2: "record_network", record_tendency: 2 }, toast: "记录倾向上升：经验开始变成可传之物。" },
          { label: "拿出青囊残页求快些指点", set: { ch2: "show_fragment", searchPressure: 1 }, toast: "短期获得提示，但曹府探子可能看见。" },
        ],
      },
      { speaker: "woman", line: "他手热回来了！他能喘了！" },
      { speaker: "chenbo", line: "药不贵，贵的是看准。小先生，你救的不是一条命，是一张药签的去处。" },
      { speaker: "aj", line: "药签？" },
      { speaker: "chenbo", line: "我不识几个字，画得也丑。你若能把它整理成别人看得懂的样子，它就不是我的手艺，是街市的活路。" },
      {
        choices: [
          { label: "「我会把它整理好，让它成为街市的活路，而不是谁的私藏。」", set: { chenbo_trust: 1, record_tendency: 1 }, toast: "陈伯笑了，露出豁牙。" },
          { label: "「我只想拿到能用的方子，别的不管。」", set: { chenbo_trust: -1 } },
        ],
      },
      { speaker: "chenbo", line: "曹府今日查得紧，你这身药童衣撑不了多久。" },
      { speaker: "aj", line: "我该去哪？" },
      { speaker: "chenbo", line: "曹府档案区有华先生旧问诊录。若你能拿到那东西，再配一张像样的文书，城里人就不敢随便拦你。" },
      { speaker: "aj", line: "去曹府？那不是自投罗网？" },
      { speaker: "chenbo", line: "不去，你连网在哪里都不知道。" },
      { narration: true, line: "曹府搜查药市。阿吉发现单靠药童路引撑不过下一轮盘查，只能主动冒险进入曹府档案区。" },
      { gotoChapter: "ch3" },
    ],
  },

  ch3: {
    scene: "cao_mansion",
    title: "曹府档案区",
    fullTitle: "第三章 · 曹府档案区 · 王济与制度边界",
    images: {
      0: "/images/levels/1/chapters/ch3_beats/beat00_residue_slip.webp",
      2: "/images/levels/1/chapters/ch3_beats/beat02_cao_hall.webp",
      3: "/images/levels/1/chapters/ch3_beats/beat03_wangji_desk.webp",
      8: "/images/levels/1/chapters/ch3_beats/beat08_three_cases.webp",
      18: "/images/levels/1/chapters/ch3_beats/beat18_wangji_record.webp",
      22: "/images/levels/1/chapters/ch3_beats/beat22_fake_document.webp",
    },
    beats: [
      { narration: true, line: "曹府外院朱门半开，药房小吏来回搬运药箱。阿吉压低帽檐，把药童路引藏在袖中。" },
      { speaker: "clerk", line: "哪位医者门下？" },
      { speaker: "aj", line: "牢中旧药补送，按曹府药房缺册来的。" },
      { speaker: "clerk", line: "路引。" },
      {
        ifKey: "boxCompartment",
        ifVal: "found",
        beats: [
          { speaker: "clerk", line: "华佗牢里的？晦气。送完就走，别乱看。" },
        ],
      },
      {
        ifKey: "boxCompartment",
        ifVal: "missed",
        beats: [
          { narration: true, line: "路引缺角，药签也还不够干净。阿吉只能绕过守卫，从药房后窗翻入。追索压力又紧了一分。" },
        ],
      },
      { speaker: "wangji", line: "翻病案柜的手，比送药的手稳。" },
      { speaker: "aj", line: "你早就看见我了？" },
      { speaker: "wangji", line: "从你进门开始。华先生的徒弟，不该只会逃。" },
      { speaker: "aj", line: "我来拿问诊录。" },
      { speaker: "wangji", line: "拿去做什么？藏在木盒里？交给街市？还是烧掉？" },
      { speaker: "aj", line: "我还没决定。" },
      { speaker: "wangji", line: "那就先证明你有资格不决定。" },
      {
        explore: {
          hint: "曹府喜欢按身份排序。查清三份病案，再决定谁更急。",
          image: "/images/levels/1/chapters/ch3_beats/beat02_cao_hall.webp",
          hotspots: [
            {
              id: "case_cabinet",
              label: "病案柜",
              x: 45,
              y: 49,
              beats: [
                { speaker: "aj", line: "军士、孩童、老仆……三份病案被压在最上面。" },
                { speaker: "wangji", line: "曹府喜欢排序。你若不喜欢，就给我一个更好的顺序。" },
              ],
            },
            {
              id: "pharmacy",
              label: "药房",
              x: 25,
              y: 62,
              beats: [
                { speaker: "aj", line: "军士的止血药已经备齐。" },
                { speaker: "wangji", line: "所以他看上去最重要，却未必最急。" },
              ],
            },
            {
              id: "watch",
              label: "值班记录",
              x: 64,
              y: 66,
              beats: [
                { narration: true, line: "值班记录写明：天亮后库房点验，所有文书重查。" },
                { narration: true, line: "线索：点验时间。王济的假文书只能撑到天亮。" },
              ],
            },
            {
              id: "soldier_case",
              label: "军士营房",
              x: 78,
              y: 56,
              beats: [
                { narration: true, line: "军士失血甚多，但止血药和人手都已备齐。" },
                { narration: true, line: "线索：失血记录。" },
              ],
            },
            {
              id: "child_case",
              label: "孩童病房",
              x: 36,
              y: 32,
              beats: [
                { speaker: "aj", line: "这孩子和街市那个一样，高热惊厥。" },
                { narration: true, line: "若持有陈伯药签，此处会提醒：先稳住气息，切忌猛灌汤药。" },
              ],
            },
            {
              id: "old_servant",
              label: "老仆房",
              x: 16,
              y: 44,
              beats: [
                { narration: true, line: "老仆久咳体虚，需调养，却不在立刻断气的关口。" },
                { narration: true, line: "线索：久咳体虚记录。" },
              ],
            },
            {
              id: "desk",
              label: "王济案桌",
              x: 58,
              y: 42,
              beats: [
                { speaker: "wangji", line: "证据不足时，不能贸然动案。你若要改曹府的顺序，就先拿出比身份更硬的理由。" },
              ],
            },
          ],
        },
      },
      {
        game: {
          id: "case_triage",
          name: "曹府查案",
          kind: "caseTriage",
          unlockItem: "wangji_document",
          nextBeatUnlocked: "病案顺序被重新排定。问诊录与假文书到手，但制度这扇门仍然很深。",
          context: "根据病案柜、药房、值班记录和病房线索排序：不是看身份贵贱，而是看谁更急。",
          reward: { item: "wangji_document", skill: "wangji_trust" },
        },
      },
      {
        choices: [
          { label: "偷改病案，让曹府替阿吉背锅", set: { ch3: "tamper_case", wangji_trust: -1 }, toast: "追索压力短降，但王济不再信任你。" },
          { label: "继续翻找府库，确认青囊是否已有抄本", set: { ch3: "over_search", searchPressure: 2 }, toast: "线索更多，巡查也更近。" },
          { label: "坚持记录“先病后身”", set: { ch3: "patient_first", system_tendency: 2, wangji_trust: 1 }, toast: "王济信任上升：制度先受医德约束。" },
        ],
      },
      { speaker: "wangji", line: "孩童、军士、老仆。你没有按身份排。" },
      { speaker: "aj", line: "病不会因为谁穿甲、谁穿布衣就让路。" },
      { speaker: "wangji", line: "这句话若写进府库，很多人会不高兴。" },
      { speaker: "aj", line: "那就更该写。" },
      {
        choices: [
          { label: "「按曹府旧例排吧，省得给自己惹麻烦。」", set: { asked_heart: -1 } },
          { label: "「先救最急的人，并把这条写进府库的规矩里。」", set: { asked_heart: 1, medical_skill: 1, system_tendency: 1 }, toast: "王济沉默地记下了这一条。" },
        ],
      },
      { speaker: "wangji", line: "这是“残卷已焚”的归档文书，只能撑到天亮。" },
      { speaker: "aj", line: "你为什么帮我？" },
      { speaker: "wangji", line: "因为你还没有把青囊交给任何一扇门。人在门外时，反而可能看清门里有什么。" },
      {
        choices: [
          { label: "「我不会把它交给任何一扇门，只想让它经得起被人查。」", set: { wangji_trust: 1, system_tendency: 1 }, toast: "王济神色微动，对你多了几分托付。" },
          { label: "「门里门外都一样，谁给我方便我就靠谁。」", set: { wangji_trust: -1 } },
        ],
      },
      { speaker: "wangji", line: "府里正在追查街上的华佗歌。若那些歌唱错，害的人不会比错方子少。" },
      { speaker: "aj", line: "歌？" },
      { speaker: "wangji", line: "字会被烧，歌会乱跑。去听听吧，华先生的小弟子。" },
      { narration: true, line: "阿吉从曹府侧门离开。巷口有人唱错救急歌诀，若错误扩散，青囊即使传下去也会变成祸患。" },
      { gotoChapter: "ch4" },
    ],
  },

  ch4: {
    scene: "music_house",
    title: "民间乐坊",
    fullTitle: "第四章 · 民间乐坊 · 玄音与传播边界",
    images: {
      0: "/images/levels/1/chapters/ch4_beats/beat00_xuanyin_song.webp",
      2: "/images/levels/1/chapters/ch4_beats/beat02_xuanyin_pipa.webp",
      5: "/images/levels/1/chapters/ch4_beats/beat05_torn_paper.webp",
      14: "/images/levels/1/chapters/ch4_beats/beat14_fingertips.webp",
      20: "/images/levels/1/chapters/ch4_beats/beat20_song_spreads.webp",
      24: "/images/levels/1/chapters/ch4_beats/beat24_leave_for_shrine.webp",
    },
    beats: [
      { narration: true, line: "阿吉从曹府侧门离开，天色将明未明。巷子里有孩童拍手唱歌，曲调轻快，词却让他猛地停住。" },
      { speaker: "child", line: "头热惊，手足冷，猛灌汤，压喉声……" },
      { speaker: "aj", line: "停！这句是谁教你的？" },
      { speaker: "child", line: "茶摊旁的哥哥唱的，大家都会唱。" },
      {
        explore: {
          hint: "错误歌诀会比错方子传得更快。追踪它从哪里来，再决定哪些能唱、哪些必须禁传。",
          image: "/images/levels/1/chapters/ch4_beats/beat00_xuanyin_song.webp",
          hotspots: [
            {
              id: "singing_child",
              label: "唱歌孩童",
              x: 36,
              y: 56,
              beats: [
                { speaker: "aj", line: "“猛灌汤”会害死人。高热惊厥时乱灌，孩子会呛住。" },
                { narration: true, line: "获得错误歌词：猛灌汤。" },
              ],
            },
            {
              id: "tea_guest",
              label: "茶摊客",
              x: 63,
              y: 52,
              beats: [
                { speaker: "tea_guest", line: "我也是听乐坊唱的。说是华佗留下来的救命歌，谁不想学两句？" },
                { speaker: "aj", line: "传得这么快……" },
                { narration: true, line: "获得线索：从乐坊传出。" },
              ],
            },
            {
              id: "busker",
              label: "卖唱艺人",
              x: 74,
              y: 38,
              beats: [
                { speaker: "busker", line: "我唱的是“莫乱灌”，不是“猛灌汤”。谁把字听岔了？" },
                { narration: true, line: "获得正确歌词碎片：莫乱灌。" },
              ],
            },
            {
              id: "paper",
              label: "歌词残纸",
              x: 49,
              y: 75,
              beats: [
                { narration: true, line: "纸上既有正确句，也夹着危险的重方细节。传播若没有边界，会把错也带远。" },
                { narration: true, line: "获得：正确歌词碎片、错误歌词碎片。" },
              ],
            },
            {
              id: "patrol",
              label: "巡卒",
              x: 86,
              y: 46,
              beats: [
                { speaker: "patrol", line: "曹府查华佗妖歌！谁唱，谁跟我们走。" },
                { narration: true, line: "王济假文书还能拖延片刻，但天亮后就会失效。" },
              ],
            },
            {
              id: "door",
              label: "乐坊门",
              x: 18,
              y: 48,
              beats: [
                { narration: true, line: "乐坊半掩，里面有人拨着旧琵琶。阿吉知道，错歌的源头就在门后。" },
              ],
            },
          ],
        },
      },
      { speaker: "xuanyin", line: "你一路追到这里，是来抓唱歌的人，还是来改错字的人？" },
      { speaker: "aj", line: "若只是错字，我不会追。错的是救命法子。" },
      { speaker: "xuanyin", line: "那你来得正好。我能让一条巷子都记住它，却不能保证每张嘴都唱对它。" },
      { speaker: "xuanyin", line: "字会被烧，简会被夺，曲子藏在人嘴里。" },
      { speaker: "aj", line: "可人嘴也会传错。" },
      { speaker: "xuanyin", line: "所以我等的不是会写字的人，是懂哪一句不能唱的人。" },
      {
        choices: [
          { label: "「歌靠不住，唱错就害人，不如不唱。」", set: { xuanyin_trust: -1 } },
          { label: "「歌能让人记住救命的法子，我信你这条路。」", set: { xuanyin_trust: 1 }, toast: "玄音挑了挑眉，没料到你这样说。" },
        ],
      },
      {
        game: {
          id: "song_formula",
          name: "歌诀纠错",
          kind: "songFormula",
          unlockItem: "xuanyin_song_page",
          nextBeatUnlocked: "可入歌的救急句与必须禁传的危险句被分开。歌页能走远，禁录也必须同行。",
          context: "把正确歌词和错误歌词分开，判断哪些基础救急可以入歌，哪些毒药剂量、针刺深浅和复杂辨证必须禁传。",
          reward: { item: "xuanyin_song_page", skill: "xuanyin_trust" },
        },
      },
      {
        choices: [
          { label: "让玄音先唱出去，再一路校正", set: { ch4: "spread_then_fix", spread_tendency: 2 }, toast: "传播倾向上升，低完成时误传风险也会上升。" },
          { label: "保留传播禁录，要求歌页与禁录同行", set: { ch4: "keep_forbidden_record", spread_tendency: 1 }, toast: "玄音线更稳：传播有了边界。" },
          { label: "主动销毁错误歌词碎片", set: { ch4: "destroy_wrong_song", burn_tendency: 1 }, toast: "焚毁倾向上升，但误传风险下降。" },
        ],
      },
      { speaker: "xuanyin", line: "基础救急可入歌，毒药剂量不可入歌，针刺深浅不可入歌。" },
      { speaker: "aj", line: "能让人撑到见大夫的，可以唱；必须见了病人才知道的，不能唱。" },
      { speaker: "xuanyin", line: "这张歌页，我收下。但这张禁录，你也要收下。没有边界的传播，比沉默更危险。" },
      {
        choices: [
          { label: "「唱错的那些太危险，必须先毁掉。」", set: { burn_tendency: 1 }, toast: "你更倾向把危险的部分付之一炬。" },
          { label: "「我信你能把它唱对、唱远——歌页交给你。」", set: { xuanyin_trust: 1 }, toast: "玄音把歌页贴到了胸口。" },
        ],
      },
      { speaker: "patrol", line: "里面的人，出来！曹府查华佗妖歌！" },
      { speaker: "xuanyin", line: "官爷，唱错词的人在东巷。我带你们去。" },
      { speaker: "aj", line: "你会被抓。" },
      { speaker: "xuanyin", line: "错歌若传出去，抓不抓我都一样糟。走。" },
      { speaker: "aj", line: "这歌，我该怎么带下去？" },
      {
        choices: [
          { label: "「歌页与禁录一起带，让它走得稳、传得对。」", set: { spread_tendency: 1, xuanyin_trust: 1 }, toast: "传播有了边界，玄音对你更放心。" },
          { label: "「先让它传开再说，能多记一句是一句。」", set: { spread_tendency: 2 }, toast: "传播倾向上升，但误传风险也随之上升。" },
        ],
      },
      { speaker: "xuanyin", line: "你要把青囊交给谁？" },
      { speaker: "aj", line: "我还不知道。" },
      { speaker: "xuanyin", line: "那就去一个安静的地方，把你手里的东西都摆出来。东西会比人诚实。" },
      { narration: true, line: "阿吉带着青囊残页、陈伯药签、曹府问诊录和玄音歌页，前往华佗旧义诊的城外旧祠。这里不是随机终点，而是华佗曾经把医术交给民间的地方。" },
      { gotoChapter: "ch5" },
    ],
  },

  ch5: {
    scene: "old_shrine",
    title: "旧祠裁断",
    fullTitle: "第五章 · 青囊归处 · 旧祠裁断",
    images: {
      0: "/images/levels/1/chapters/ch5_beats/beat00_old_shrine.webp",
      1: "/images/levels/1/chapters/ch5_beats/beat01_three_relics.webp",
      3: "/images/levels/1/chapters/ch5_beats/beat03_wind_candle.webp",
      4: "/images/levels/1/chapters/ch5_beats/beat04_huatuo_wisdom.webp",
      6: "/images/levels/1/chapters/ch5_beats/beat06_glowing_slip.webp",
      8: "/images/levels/1/chapters/ch5_beats/beat08_farewell.webp",
    },
    beats: [
      { narration: true, line: "城外旧祠荒草没阶，墙上还残留着华佗当年义诊时贴过方子的痕迹。阿吉推门进去，晨风吹得木盒轻轻作响。" },
      { speaker: "aj", line: "师父，我带出来了。" },
      { narration: true, line: "没有人回答。案台上只有积灰和几枚旧针痕。" },
      { speaker: "aj", line: "可我还是不知道该交给谁。" },
      { speaker: "aj", line: "这是从牢里拼回来的。缺口还在。" },
      {
        // medical_skill 现为「高+1/低-1/中0」刻度：高分=1
        ifKey: "medical_skill",
        ifVal: "1",
        beats: [
          { narration: true, line: "残页上的字虽然断裂，但病症、医理、药方尚能相互照应。" },
        ],
      },
      {
        // 中评=0
        ifKey: "medical_skill",
        ifVal: "0",
        beats: [
          { narration: true, line: "有几处字仍然模糊，像没有来得及说完的话。" },
        ],
      },
      { speaker: "aj", line: "陈伯的药签。画得粗，却能让药工看懂。" },
      { speaker: "aj", line: "王济的问诊录。字很正，门也很深。" },
      { speaker: "aj", line: "玄音的歌页。唱得出去，也可能唱错。" },
      {
        ifKey: "ch4",
        ifVal: "keep_forbidden_record",
        beats: [
          { narration: true, line: "歌页旁另有禁录，标明不可入歌的危险内容。" },
        ],
      },
      { speaker: "huatuo", line: "你问哪条路不会断。阿吉，没有不会断的路，只有不断修的人。" },
      { speaker: "aj", line: "所以我不是选一个人，是选一种以后还会被修正的方法。" },
      { speaker: "aj", line: "陈伯能让药进街市，王济能让字进府库，玄音能让歌进人群。" },
      { speaker: "aj", line: "可街市会散，府库会锁，歌也会错。" },
      {
        choices: [
          { label: "「会错，也好过让它彻底消失。」", set: { burn_tendency: -1 } },
          { label: "「与其传错、被滥用，不如一把火了断。」", set: { burn_tendency: 1 }, toast: "你心底升起了焚毁的念头。" },
        ],
      },
      { speaker: "huatuo", line: "那就看你一路留下了什么。空手托付，叫赌；带着证据托付，才叫传承。" },
      {
        choices: [
          { label: "「我只想尽快了结。」", set: { huatuo_trust: -1 } },
          { label: "「您的每一句话，我都没有空手忘掉。」", set: { huatuo_trust: 1 }, toast: "华佗的神色，第一次松了一分。" },
        ],
      },
      { narration: true, line: "阿吉伸手之前，案台上的物件已经替他说出了一半答案。剩下的一半，才是他的选择。" },
      { gotoTrust: true },
      { narration: true, line: "阿吉做出了最后动作。青囊残术的归处，不只由这一刻决定，也由他一路留下的证据决定。" },
      { gotoEnding: true },
    ],
  },
};
