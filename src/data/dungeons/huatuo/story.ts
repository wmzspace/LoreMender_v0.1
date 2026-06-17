import type { StoryChapter } from "../../types";

export const STORY: Record<string, StoryChapter> = {
  ch1: {
    scene: "xuchang_prison",
    title: "许昌大牢",
    fullTitle: "第一章 · 许昌大牢 · 青囊残术",
    beats: [
      { narration: true, line: "建安十三年，许昌大牢。\n黑暗中，一只手在枯草里摸索。" },
      { speaker: "aj", line: "这里是……哪里？头好痛。" },
      { narration: true, line: "烛火摇曳中，隔壁囚室里有一个苍老身影，膝前散落着断裂竹简。" },
      { speaker: "huatuo", line: "醒了？过来。那些竹筒，散了。" },
      { speaker: "aj", line: "师父……这写的是《青囊经》？" },
      { speaker: "huatuo", line: "是一生所学，也只是一点残术。今夜之后，它能不能留下，我不知道。" },
      { speaker: "aj", line: "我带它走。只要我还活着，就不会让它落进曹府手里。" },
      { speaker: "huatuo", line: "不。你要记住，守住一本书，不等于守住医道。" },
      { speaker: "aj", line: "那我该怎么做？" },
      { speaker: "huatuo", line: "天亮前，找到一条不会断的路。有人会把经验藏在手里，有人会把文字锁进府库，也有人会把救命法子唱给百姓听。你要亲眼看过，才能替青囊决定归处。" },
      { narration: true, line: "华佗没有把书直接交给你，只把混在一处的竹简推到牢门边。竹简上有病症、医理、药方，也有被血迹浸花的字。" },
      {
        game: {
          id: "bamboo_puzzle",
          name: "拼竹筒",
          kind: "bambooPuzzle",
          unlockItem: "wooden_box",
          nextBeatUnlocked: "竹简归位，断裂的绳编下，露出一个旧木盒。",
          context: "竹简散了，华佗没有告诉你顺序——你得自己找出那套活的逻辑。",
          reward: { item: "wooden_box", skill: "medical_skill" },
        },
      },
      // ── 小游戏高完成度：华佗额外提示 ──
      {
        ifKey: "medical_skill",
        ifVal: "2",
        beats: [
          { speaker: "huatuo", line: "你拼对了每一片。记住——医术不是给最尊贵的人，而是给最需要的人。" },
        ],
      },
      { narration: true, line: "三幅竹简图各归其位。断裂的绳编下，露出一个旧木盒。" },
      { speaker: "huatuo", line: "书能拼起，只是第一步。曹府会搜你的身，若要带走残术，还得让它先从他们眼前消失。" },
      { narration: true, line: "木盒正面有一枚钥匙孔，孔边刻着药囊纹。钥匙藏在盒中机关最深处。" },
      {
        game: {
          id: "wooden_box",
          name: "木盒机关",
          kind: "woodenBox",
          unlockItem: "qingsang_fragment",
          requiredItem: "wooden_box",
          nextBeatUnlocked: "钥匙入孔，木盒暗格终于弹开。",
          context: "钥匙藏在机关最深处。走最短的路，才值得把它取出来。",
          reward: { item: "qingsang_fragment", skill: "asked_heart" },
        },
      },
      { narration: true, line: "钥匙入孔，木盒暗格弹开。\n你获得「青囊残术」。它不是完整医书，而是接过医道的资格。" },
      { speaker: "huatuo", line: "我不能把一生都塞进你一夜里。但你若记住为何救人，青囊便已有了归处。" },
      { narration: true, line: "牢门外传来铁链拖地声。" },
      { speaker: "soldier", line: "小郎中，起来。魏王要见你。" },
      { speaker: "huatuo", line: "阿吉，别急着相信谁，也别急着恨谁。你一路看见的，都会变成答案。" },
      // ── 搜身演出（依木盒夹层结果分支）──
      {
        ifKey: "boxCompartment",
        ifVal: "found",
        beats: [
          { narration: true, line: "阿吉被拖出牢门。搜身时，木盒夹层擦过狱卒的手指，里面的残卷没有发出一点声响。" },
        ],
      },
      {
        ifKey: "boxCompartment",
        ifVal: "missed",
        beats: [
          { narration: true, line: "阿吉被拖出牢门。搜身时，狱卒的手在木盒上停了一下——你的心提到嗓子眼。所幸他只当是寻常旧物，挥手放过。" },
        ],
      },
      { narration: true, line: "阿吉第一次明白：传承不是“把书带走”这么简单。真正的问题是——书离开牢狱之后，要落到哪里，才不会再次死去？" },
      // ── 转场伏笔：押解经街市，听见半句残歌（第四章回收）──
      { narration: true, line: "押解的队伍向曹府去，途中要穿过刚刚天亮的许昌街市。人群嘈杂，阿吉忽然听见有人哼唱半句残缺的医诀——" },
      { narration: true, line: '“头热惊，手足冷，莫乱灌，先……”\n歌声断在最要紧处，再没有下文。' },
      { gotoChapter: "ch2" },
    ],
  },

  // =====================================================
  // 第二章 · 押解街市 · 陈伯与民间验方
  // 角色核心冲突：经验要不要写下来？
  // 陈伯设定：不识全字但识药多年，习惯把验方藏在自己手里
  // =====================================================
  ch2: {
    scene: "street_market",
    title: "押解街市",
    fullTitle: "第二章 · 押解街市 · 陈伯与民间验方",
    beats: [
      { narration: true, line: "天色刚亮，阿吉被狱卒押往曹府。街市因疫病和征发而混乱，药摊被翻倒，药包散落一地。" },
      { narration: true, line: "人群中，一个孩子倒在母亲怀里，额头滚烫，手脚却冷得发青。" },
      { speaker: "aj", line: "他像是高热惊厥，不能再拖。" },
      { speaker: "soldier", line: "你自身难保，还想管别人？让开，曹府提审要紧！" },
      { narration: true, line: "押解队伍被人群堵住。一个花白头发的老人蹲在翻倒的药摊旁，把散落的药渣一撮撮捡回粗布口袋。" },
      { speaker: "chenbo", line: "小郎中，别看了。这些草根不值钱，真到了断气时候，贵药未必比它们快。" },
      { narration: true, line: "他动作极稳，仿佛这兵荒马乱的街市与他无关。" },
      { speaker: "aj", line: "老人家，你是大夫？" },
      { speaker: "chenbo", line: "不算。在药市摸了三十年，乡亲们信我的手。至于名号——没人在意。" },
      { narration: true, line: "他说着，顺手捏起一小撮药渣闻了闻，又摇了摇头扔到一边。那眼神像在辨认老熟人。" },
      { speaker: "aj", line: "你会的方子，有记下来吗？若有一天你不在，旁人怎么办？" },
      { speaker: "chenbo", line: "记什么记？我连自己的名字都写得歪歪扭扭。这双手在，药就在。手不在了，记给谁看？" },
      {
        choices: [
          { label: "「写下来，才能传给更多人。」", set: { ch2: "urge_write" } },
          { label: "「可是万一哪天你出了意外……」", set: { ch2: "worry_loss" } },
          { label: "「你说得对，手艺活确实难写。」", set: { ch2: "agree_him" } },
        ],
      },
      // ---- 选择1: 劝写 ----
      {
        ifKey: "ch2",
        ifVal: "urge_write",
        beats: [
          { speaker: "aj", line: "写下来，才能传给更多人。你不在了，这些方子就没了。" },
          { speaker: "chenbo", line: "呵呵，你以为写下来就能传下去？前年瘟疫，衙门的药库账本写得比谁的方子都漂亮——可药呢？全进了权贵的私库！" },
          { speaker: "chenbo", line: "字是死的，手是活的。我这三十年的手，从没因为一个字写得好就多救一个人。" },
          { speaker: "aj", line: "但师父的《青囊经》也是写下来的。没有字，我今天连你在用什么药都不知道。" },
          { speaker: "chenbo", line: "……华先生的徒弟，果然牙尖嘴利。" },
          { narration: true, line: "陈伯沉默了一会儿，低头看着自己粗糙的手掌。那上面有几十种药渍的颜色，像一幅看不懂的地图。" },
          { speaker: "chenbo", line: "也罢。你说得对，写不写是一回事，写不写得对是另一回事。这些药签你先拿着——" },
        ],
      },
      // ---- 选择2: 担忧失传 ----
      {
        ifKey: "ch2",
        ifVal: "worry_loss",
        beats: [
          { speaker: "aj", line: "可是万一哪天你出了意外，这些方子就跟你一起埋进土里了。乡亲们怎么办？" },
          { speaker: "chenbo", line: "埋了就埋了。你以为我不心疼？我比谁都心疼！可你见过几个认字的人愿意蹲在药摊前闻药渣？" },
          { speaker: "chenbo", line: '那些读书人，写方子像写诗，什么「三钱二分」，可穷人家的秤连两都称不准！他们写的方子，乡亲们看得懂吗？' },
          { speaker: "aj", line: "那就写成乡亲们看得懂的样子。画图也行，画叶子也行。" },
          { speaker: "chenbo", line: "……画叶子。倒是个法子。" },
          { narration: true, line: "陈伯从怀里掏出几张皱巴巴的纸片，上面果然画着粗糙的叶子形状——那是他给自己做的记号。" },
          { speaker: "chenbo", line: "我试过。但画得乱七八糟，自己第二天都认不全。你既然是华先生的徒弟，帮我看看——" },
        ],
      },
      // ---- 选择3: 顺着说 ----
      {
        ifKey: "ch2",
        ifVal: "agree_him",
        beats: [
          { speaker: "aj", line: "你说得对，手艺活确实难写。抓药的手感和火候，纸上哪写得清楚。" },
          { speaker: "chenbo", line: "哦？我本以为你会跟那些读书人一样，张口就是「为万世开太平」。" },
          { speaker: "chenbo", line: "不过——你说对了一半。手艺活难写，但不是不能写。我老头子偷懒，你倒替我找借口。" },
          { speaker: "aj", line: "我不是替你找借口，只是……" },
          { speaker: "chenbo", line: "只是觉得我年纪大了，不忍心催我，是吧？小郎中，心善是好事，但心善救不了人。" },
          { speaker: "chenbo", line: "华先生当年在牢里还想着把书传下去，我在这街市上有手有脚，有什么理由偷懒？" },
          { narration: true, line: "陈伯从怀里掏出几张皱巴巴的纸片，上面的字歪歪扭扭，但每一味药旁边都画了粗糙的叶子形状。" },
          { speaker: "chenbo", line: "我试过，但理不顺。你帮我看看，这些乱七八糟的东西能不能整理成旁人也能用的方子——" },
        ],
      },
      // ---- 收束 ----
      { narration: true, line: "狱卒催促你继续走。陈伯却把几张写残的药签塞入你手中：若真是华先生弟子，就把散掉的东西捡起来。" },
      {
        game: {
          id: "herb_memory",
          name: "验方整理",
          kind: "herbMemory",
          unlockItem: "folk_prescription",
          nextBeatUnlocked: "三张药签被整理成人能读懂的样子。",
          context: "陈伯把写残的药签塞进你手里。先记住，再整理——这些字迹歪斜的纸片，要变成旁人也能用的东西。",
          reward: { item: "folk_prescription", skill: "chenbo_trust" },
        },
      },
      { speaker: "chenbo", line: "原来写下来，不是把饭碗交出去，是把救命的路留给旁人。" },
      { narration: true, line: "孩子的呼吸慢慢平稳下来。人群散开，押解队伍重新上路。陈伯把整理好的残签郑重塞回你手中。" },
      { speaker: "chenbo", line: "曹府今日要审几份病案。我听药库的人说，案上有军士、孩童、老仆。小郎中，进了那扇门，别让他们按身份给人排命。" },
      { narration: true, line: "阿吉握着残签，第一次明白：医术若只藏在手里，会随人老去；可若只写在纸上，也未必到得了穷人手里。" },
      // ── ch2→ch3 转场：哼唱断歌，狱卒喝止（连接第四章伏笔）──
      { narration: true, line: "押解队伍继续前行。将到曹府门前，墙角忽然有人低声哼唱起街市里断掉的那句医诀。" },
      { speaker: "soldier", line: "不许唱！府中正在查这些乱传的华佗歌。" },
      { gotoChapter: "ch3" },
    ],
  },

  // =====================================================
  // 第三章 · 曹府问审 · 王济与权力边界
  // 角色核心冲突：医术应该进入制度还是保持独立？
  // 王济设定：通文书、懂制度，相信医术入府库才能传远，但可能让医术服从权门
  // =====================================================
  ch3: {
    scene: "cao_mansion",
    title: "曹府问审",
    fullTitle: "第三章 · 曹府问审 · 王济与权力边界",
    beats: [
      // ── 道具浮现转场：陈伯药签 ──
      { narration: true, line: "踏入曹府前，怀中那枚陈伯的残签硌了一下。阿吉低头看它——这张残签上，也有一个高热惊厥的孩子。" },
      // ── 木盒未藏好时的紧张演出 ──
      {
        ifKey: "boxCompartment",
        ifVal: "missed",
        beats: [
          { narration: true, line: "他又摸了摸贴身的木盒。方才城门搜身那一下，青囊险些被搜出，此刻盒身还带着汗。" },
        ],
      },
      { narration: true, line: "阿吉被押入曹府。朱漆大堂，青铜灯树，三份病案压在案上：军士、孩童、老仆。案旁还放着一只空药匣——显然有人已准备搜走华佗遗物。" },
      { speaker: "wangji", line: "你就是华佗的小徒弟？坐。不用怕——至少在审完这些病案之前。" },
      { narration: true, line: "说话的人穿着干净的文士袍，手指修长，案上笔墨摆放得一丝不苟。王济，曹府幕僚，掌管文书与医案归档。" },
      { speaker: "wangji", line: "一卷残术藏在你衣内，只能救一人。若入府库，或可救一城。" },
      { speaker: "aj", line: "若府库只为将军开门，又算救一城吗？" },
      { speaker: "wangji", line: "世道如此，先救能保住更多人的人。你不喜欢，我也理解。但你有没有想过——没有制度，连这一个都救不了。" },
      { narration: true, line: "他翻开案卷，墨迹未干，排序却像已经写好。三份病案，等着你用青囊残术重新审证。" },
      {
        choices: [
          { label: "「制度若没有医德约束，会变成武器。」", set: { ch3: "warn_ethics" } },
          { label: "「你能保证府库不会变成权贵的私藏吗？」", set: { ch3: "doubt_system" } },
          { label: "「你说得有理，但我不信曹府。」", set: { ch3: "distrust_cao" } },
        ],
      },
      // ---- 选择1: 制度需医德约束 ----
      {
        ifKey: "ch3",
        ifVal: "warn_ethics",
        beats: [
          { speaker: "aj", line: "制度若没有医德约束，会变成武器。师父从来不问病人身份，只管谁更需要救。" },
          { speaker: "wangji", line: "华先生当然可以不问——他只有一双手，治一个算一个。可若想把医术传给千万人，你绕得开制度吗？" },
          { speaker: "wangji", line: "你师父的事，我很难过。但正因如此，才更应该让医书进入府库。烧了一本，还有抄本；禁了一处，还有别处。" },
          { speaker: "aj", line: "那谁来保证抄本不会被人篡改？谁来保证府库的门对穷人也是开着的？" },
          { speaker: "wangji", line: "……你问得好。说实话，我保证不了。但我可以保证：若你愿意留下医理，我会在归档条例里加上一条——「医术当以济世为先，不以权势为序」。" },
          { narration: true, line: "王济说这句话时，第一次没有看案上的卷宗，而是看着你的眼睛。" },
        ],
      },
      // ---- 选择2: 怀疑制度 ----
      {
        ifKey: "ch3",
        ifVal: "doubt_system",
        beats: [
          { speaker: "aj", line: "你能保证府库不会变成权贵的私藏吗？前年瘟疫，衙门药库的账本写得漂亮，药却全进了私库。" },
          { speaker: "wangji", line: "……你连这个都知道。看来华先生教的不只是医术。" },
          { speaker: "wangji", line: "你说得对，我不敢保证。制度是刀，握在谁手里就替谁砍。但我在这里，至少能让这把刀在医术这件事上，刀刃朝外。" },
          { speaker: "aj", line: "那如果你不在这里了呢？换个幕僚，把归档条例一改，医书照样变私产。" },
          { speaker: "wangji", line: "所以我才需要你的残术。华佗的名字本身就是一块碑——谁也不敢轻易动刻着他名字的东西。你在帮我，我也在帮你师父。" },
          { narration: true, line: "王济的手指在案卷边缘轻轻敲了两下。那是一个幕僚在计算利害时的习惯动作。" },
        ],
      },
      // ---- 选择3: 不信任曹府 ----
      {
        ifKey: "ch3",
        ifVal: "distrust_cao",
        beats: [
          { speaker: "aj", line: "你说得有理。但我不信曹府。师父就是被曹府……" },
          { speaker: "wangji", line: "我知道。你想说华先生是被曹府害死的，所以你不信这扇门里的任何一个人。" },
          { speaker: "wangji", line: "但小郎中，你有没有想过——正因为华先生不在了，才更需要有人把他的医理放在曹府的眼皮底下？" },
          { speaker: "aj", line: "放在眼皮底下？你是说……" },
          { speaker: "wangji", line: "最危险的地方，有时候最安全。曹府不会去翻一本已经归档入库的书。但如果书流落民间，反而会被当作禁物追缴。" },
          { speaker: "wangji", line: "我不是在替曹府说话。我是在替这些字找一个不会被烧掉的地方。" },
          { narration: true, line: "王济的声音压得很低，像是怕青铜灯树上的火苗听见。" },
        ],
      },
      // ---- 收束 ----
      { narration: true, line: "王济看着你，等你用青囊残术重新审证这三份病案。" },
      {
        game: {
          id: "case_triage",
          name: "病案推理",
          kind: "caseTriage",
          unlockItem: "case_record",
          nextBeatUnlocked: "病案顺序被重新排定。",
          context: "三份病案，不问身份，只看谁更需要这双手。陈伯的药签或许能帮你——用青囊残术，重排轻重。",
          reward: { item: "case_record", skill: "wangji_trust" },
        },
      },
      { speaker: "wangji", line: "你没有按军功、年龄、身份排序。" },
      { speaker: "aj", line: "病不会因为谁穿甲、谁穿布衣，就先退一步。" },
      { speaker: "wangji", line: "制度若不先受医德约束，确实会把医术变成另一道门槛。" },
      { narration: true, line: "王济合上案卷，在归档页上写下一行小字：医术当以济世为先，不以权势为序。" },
      { speaker: "wangji", line: "我可以把残术收进府库，也可以帮你离开。" },
      { speaker: "aj", line: "你为什么帮我？" },
      { speaker: "wangji", line: "因为我看见了你怎么给三个人排命。若青囊只能在曹府和你之间选，我宁愿让它再多走一段路。" },
      // ── 假文书 + 天亮倒计时 ──
      { narration: true, line: "王济递来一份文书，朱印未干。上面写着：华佗残卷，已于问审后焚毁归档。" },
      { speaker: "wangji", line: "这份文书只能拖到天亮。天亮后，库房会点验。到那时，你若还没想好青囊归处，谁也救不了你。" },
      { narration: true, line: "阿吉走出曹府时，怀里多了一份问诊录。那不是答案，而是另一个问题：若医书必须靠权力活下去，它还会不会记得自己原本要救谁？" },
      // ── ch3→ch4 转场：唱错版医诀（回收伏笔，直引乐坊）──
      { narration: true, line: "他从曹府侧门离开。巷口又传来白日里那半句歌诀——可这一次，词唱错了：" },
      { narration: true, line: '“头热惊，手足冷，猛灌汤，压喉声……”\n阿吉猛地停住脚步。他知道，这一句若传开，会害人。' },
      { gotoChapter: "ch4" },
    ],
  },

  // =====================================================
  // 第四章 · 民间乐坊 · 玄音与知识传播
  // 角色核心冲突：歌诀传播是否可靠？会不会传错害人？
  // 玄音设定：能把医理改成孩童也能记住的曲调，相信曲子藏在人嘴里
  // =====================================================
  ch4: {
    scene: "music_house",
    title: "民间乐坊",
    fullTitle: "第四章 · 民间乐坊 · 玄音与知识传播",
    beats: [
      { narration: true, line: "循着歌声，阿吉推开乐坊半掩的门。唱到“猛灌汤”那一句时，他再也忍不住。" },
      { speaker: "aj", line: "这句不能这么唱。高热惊厥不能乱灌汤，孩子可能被呛死。" },
      { narration: true, line: "门槛上坐着个年轻女子，手里拨着一把旧琵琶。她唱的不是风月，是药名、脉象和民间救急的法子。" },
      { speaker: "xuanyin", line: "你听得懂？" },
      { speaker: "aj", line: "我学过医。方才那半句，是治小儿惊风的，可后半截唱反了。" },
      { speaker: "xuanyin", line: "所以我一直在等一个懂医理的人。字会被烧，简会被夺，曲子藏在人嘴里，谁也抢不走。可曲子若错了，也会把错带到每一张嘴里。" },
      { narration: true, line: "她摊开几页残纸，上面有药名、脉象和不完整的韵脚。阿吉忽然想起牢中竹简的顺序，也想起曹府正在追查这些“华佗歌”。" },
      {
        choices: [
          { label: "「歌诀传得广，但万一传错了呢？」", set: { ch4: "worry_errors" } },
          { label: "「你不怕唱这些被人抓起来吗？」", set: { ch4: "ask_danger" } },
          { label: "「这个法子真好，我帮你补全。」", set: { ch4: "eager_help" } },
        ],
      },
      // ---- 选择1: 担心传错 ----
      {
        ifKey: "ch4",
        ifVal: "worry_errors",
        beats: [
          { speaker: "aj", line: "歌诀传得广，但万一传错了呢？你把桂枝唱成葛根，病人喝了会出事。" },
          { speaker: "xuanyin", line: "你觉得书就不会传错？我爹留给我一本手抄药谱，上面「白芍」抄成了「白灼」——写的人大概困了，多写了一笔火字旁。" },
          { speaker: "xuanyin", line: "错不在歌，错在人。歌只是船，装什么货得看撑船的人。你把医理写对，我就唱对。你写错了——那我确实会唱错。" },
          { speaker: "aj", line: "所以你等的不只是一个会写字的人，而是一个懂医理的人。" },
          { speaker: "xuanyin", line: "对。懂医理的人才知道什么能唱、什么不能唱。基础救急可以入歌，复杂处方还是要交给医者——这个边界，我一个人划不了。" },
        ],
      },
      // ---- 选择2: 担心危险 ----
      {
        ifKey: "ch4",
        ifVal: "ask_danger",
        beats: [
          { speaker: "aj", line: "你不怕唱这些被人抓起来吗？师父就是因为医书被……" },
          { speaker: "xuanyin", line: "抓我？抓一个唱歌的？" },
          { narration: true, line: "她笑了一下，但那笑容里没有轻浮。她拨了一下琴弦，琴声在巷子里弹了两弹才散。" },
          { speaker: "xuanyin", line: "小郎中，曹府可以禁书、烧简、锁库房。但他们禁不了一首歌。你今天在巷尾唱一句，明天它就跑到隔壁镇上去了。" },
          { speaker: "xuanyin", line: "你师父的事我听说过。正因如此，我才觉得——纸上的东西太容易被一把火烧干净。但人嘴里的东西，烧不掉。" },
          { speaker: "aj", line: "可是……你不怕吗？" },
          { speaker: "xuanyin", line: "怕。但怕的不是被抓——是唱错了害了人。所以我才要你帮我看看这些词。" },
        ],
      },
      // ---- 选择3: 积极帮忙 ----
      {
        ifKey: "ch4",
        ifVal: "eager_help",
        beats: [
          { speaker: "aj", line: "这个法子真好！用歌诀传医理，比抄书快多了。我帮你补全。" },
          { speaker: "xuanyin", line: "你倒是爽快。不过——别急。补歌诀不是填词，你得先想清楚：哪些能唱，哪些不能。" },
          { speaker: "aj", line: "哪些不能？" },
          { speaker: "xuanyin", line: "比如毒药的分量、下针的深浅、还有那些必须看病人脸色才能判断的——这些不能唱。唱错了，一条人命。" },
          { speaker: "xuanyin", line: "能唱的是：受了风寒喝什么、肚子疼揉哪里、小儿惊风怎么办——这些家家户户都用得上的。" },
          { speaker: "aj", line: "所以你传的不是医术，是急救常识。" },
          { speaker: "xuanyin", line: "对。真正的大病，还得找你们这些学医的。我只是让更多人活到能找到大夫的时候。" },
          { narration: true, line: "她低头看了看自己拨琴弦的手指——指尖有茧，和你的针茧位置不一样，但同样结实。" },
        ],
      },
      // ---- 收束 ----
      { narration: true, line: "玄音把残纸铺在案上，纸边压着一枚琵琶拨片。巷外远处，传来曹府巡卒的脚步声。" },
      {
        game: {
          id: "song_formula",
          name: "歌诀补全",
          kind: "songFormula",
          unlockItem: "song_page",
          nextBeatUnlocked: "残缺歌诀终于补成一页可以传唱的医理。",
          context: "玄音的残纸摊开，韵脚断在最要紧处。补全它——但禁忌提示不可删，传错了，害的是人命。",
          reward: { item: "song_page", skill: "xuanyin_trust" },
        },
      },
      { speaker: "xuanyin", line: "能传开的，未必都该乱传。基础救急可入歌，复杂处方仍要交给医者。" },
      { narration: true, line: "她重新拨弦。歌声从巷尾散开，这一次没有断在最要紧处，也没有越过不该越过的边界。" },
      { narration: true, line: "王济假文书上的朱印在阿吉怀中被汗浸湿。天快亮了——文书天亮失效，库房一旦点验，谁也救不了你。" },
      { narration: true, line: "假文书撑不到天亮。他必须在天亮前赶到旧祠。" },
      { speaker: "xuanyin", line: "你要去哪里？" },
      { speaker: "aj", line: "城外旧祠。师父以前在那里义诊。若青囊真有归处，我该在那里想明白。" },
      { narration: true, line: "原来医术不是传得越远越好，而是要知道哪些能传，哪些必须停在医者手中。" },
      // ── ch4→ch5 转场：巡卒搜查、玄音引开、带三件信物赶往旧祠 ──
      { narration: true, line: "巷外的脚步声逼近——巡卒开始沿街搜查“唱华佗歌的人”。玄音拨响琵琶，引开了一部分巡卒。" },
      { narration: true, line: "阿吉带着青囊残术、陈伯药签、曹府问诊录和玄音歌页，赶往城外旧祠。天亮之前，他必须作出选择。" },
      { gotoChapter: "ch5" },
    ],
  },

  ch5: {
    scene: "old_shrine",
    title: "青囊归处",
    fullTitle: "第五章 · 青囊归处 · 选择传承人",
    beats: [
      { narration: true, line: "夜深，阿吉来到城外旧祠。荒草没阶，墙上还留着当年义诊时贴过药方的痕迹。" },
      { narration: true, line: "案前摆着三件信物：陈伯的药签、王济的问诊录、玄音的歌页。木盒中，青囊残术微微发亮。远处城门鼓声传来，天快亮了。" },
      { speaker: "aj", line: "师父，我看过了。每一条路都能救人，也都会伤人。" },
      { narration: true, line: "风穿过旧祠破窗，像牢中那盏将熄未熄的烛火。阿吉仿佛又听见华佗的声音。" },
      { speaker: "huatuo", line: "传承不是把书交给最聪明的人，而是把救人的方法交给最不容易断绝的路。" },
      { speaker: "aj", line: "可没有一条路不会断。" },
      { speaker: "huatuo", line: "所以这不是求一个完美答案。是你愿意替哪一种代价负责。" },
      { gotoTrust: true },
      { narration: true, line: "你已经做出选择。青囊残术在掌心微微发亮，像从千年后的某处传来回应。" },
      { speaker: "huatuo", line: "去吧，典故修补者。\n让后人知道：这世上曾有人想把医道留给人间。" },
      { gotoEnding: true },
    ],
  },
};
