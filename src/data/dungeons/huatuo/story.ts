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
      { narration: true, line: "华佗没有把书直接交给你，只把混在一处的竹简推到牢门边。" },
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
      { narration: true, line: "三幅竹简图各归其位。断裂的绳编下，露出一个旧木盒。" },
      { speaker: "huatuo", line: "书能拼起，只是第一步。若要带走残术，还得打开它。" },
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
      { narration: true, line: '你获得“青囊残术”。\n它不是完整医书，而是接过医道的资格。' },
      { speaker: "huatuo", line: "我不能把一生都塞进你一夜里。但你若记住为何救人，青囊便已有了归处。" },
      { narration: true, line: "牢门外传来铁链拖地声。狱卒传令：曹府要提审华佗徒弟，即刻押走。" },
      { narration: true, line: "阿吉不是自由离开大牢，而是在押解去曹府的途中，经过混乱的许昌街市。" },
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
      { speaker: "chenbo", line: "小郎中，别看了。这些草根不值钱，真到了断气时候，贵药未必比它们快。" },
      { narration: true, line: "说话的是个花白头发的老人，蹲在翻倒的药摊旁，正把散落的药渣一撮撮捡回粗布口袋。他动作极稳，仿佛这兵荒马乱的街市与他无关。" },
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
      { narration: true, line: "陈伯把整理好的药签收进怀中，又郑重地还给你一枚残签。" },
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
      { narration: true, line: "阿吉被押入曹府。朱漆大堂，青铜灯树，三份病案压在案上：军士、孩童、老仆。" },
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
          context: "三份病案，不问身份，只看谁更需要这双手。用青囊残术，重排轻重。",
          reward: { item: "case_record", skill: "wangji_trust" },
        },
      },
      { speaker: "wangji", line: "制度若不先受医德约束，确实会把医术变成另一道门槛。" },
      { narration: true, line: "你带走了华佗留下的问诊录。字迹很轻，却比府中铜灯更亮。" },
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
      { narration: true, line: "离开曹府后，市巷深处有人唱起残缺医理。曲调轻快，词句却断在最要紧处。" },
      { speaker: "xuanyin", line: "字会被烧，简会被夺，曲子藏在人嘴里——谁也抢不走。" },
      { narration: true, line: "唱歌的是个年轻女子，坐在乐坊门槛上，手里拨着一把旧琵琶。她唱的不是风月，是药名和脉象。" },
      { speaker: "aj", line: "你在唱医理？" },
      { speaker: "xuanyin", line: "对。上个月有个游方郎中路过，唱了几段治小儿惊风的方子。我记了下来，但词不全——你看，到这一句就断了。" },
      { speaker: "aj", line: "若唱错一句，救人的方子也会害人。" },
      { speaker: "xuanyin", line: "所以我等一个懂医理的人，把散句补齐。你身上有药味——你是学医的？" },
      { narration: true, line: "她摊开几页残纸，上面有药名、脉象和不完整的韵脚。你忽然想起牢中竹简的顺序。" },
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
      { narration: true, line: "她摊开几页残纸，上面有药名、脉象和不完整的韵脚。" },
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
      { narration: true, line: "歌声从巷尾散开。你第一次觉得，纸以外也能有书。" },
      { gotoChapter: "ch5" },
    ],
  },

  ch5: {
    scene: "old_shrine",
    title: "青囊归处",
    fullTitle: "第五章 · 青囊归处 · 选择传承人",
    beats: [
      { narration: true, line: "夜深后，阿吉带着青囊残术、药市残签、曹府病案和歌诀残页来到城外旧祠。" },
      { speaker: "huatuo", line: "传承不是把书交给最聪明的人，而是把救人的方法交给最不容易断绝的路。" },
      { narration: true, line: "三位候选人的信物摆在案前：陈伯的药签、王济的病案、玄音的歌页。" },
      { gotoTrust: true },
      { narration: true, line: "你已经做出选择。青囊残术在掌心微微发亮，像从千年后的某处传来回应。" },
      { speaker: "huatuo", line: "去吧，典故修补者。\n让后人知道：这世上曾有人想把医道留给人间。" },
      { gotoEnding: true },
    ],
  },
};
