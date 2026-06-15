# AI 素材生成记录

> 这里记录插图、视频、BGM 和音效的生成工具、提示词、用途与文件路径。真实生成素材后，把“状态”从“待生成”改为“已生成”，并填写最终路径。

配套文件：

- 提示词包：`docs/ai_prompt_pack.md`
- 五关剧情大纲：`docs/story_5_level_outline.md`
- 游戏内参赛档案：封面点击“参赛档案”
- 章节插图自动接入：把图片放到 `public/images/levels/*.png` 后，剧情页会优先显示 AI 插图；若文件不存在，则继续使用内置 SVG 场景。

## 统一视觉风格

```text
2D hand-painted game background, eastern fantasy cultural storytelling, warm candle light, delicate paper texture, ink wash accents and subtle gold particles, clean composition, mobile narrative puzzle game, no text, no watermark, no UI, cinematic composition, 16:9.
```

## 插图素材

| 状态 | 素材 | 用途 | 提示词摘要 | 建议路径 |
| --- | --- | --- | --- | --- |
| 待生成 | cover_qingnang.png | 首页封面 | 华佗、青囊残卷、烛火、古籍、东方幻想游戏封面 | `public/images/cover.jpg` |
| 待生成 | level01_prison.png | 第一章场景 | 许昌大牢、烛火、散落竹简、老医者剪影 | `public/images/levels/level01_prison.png` |
| 待生成 | level02_three_people.png | 第二章场景 | 三位候选人、街巷、草药、山林与曹营暗示 | `public/images/levels/level02_three_people.png` |
| 待生成 | level03_cao_mansion.png | 第三章场景 | 朱漆大堂、青铜灯树、权力压迫、竹简 | `public/images/levels/level03_cao_mansion.png` |
| 待生成 | level04_choice.png | 第四章场景 | 深夜囚室、残卷、蜡烛、托付抉择 | `public/images/levels/level04_choice.png` |
| 待生成 | level05_echo.png | 第五章场景 | 千年回响、残卷化光、医道流传、星点 | `public/images/levels/level05_echo.png` |

## 视频素材

统一要求：6-10 秒，16:9，无文字，无水印，轻镜头运动，适合作为章节过场。

| 状态 | 素材 | 用途 | 英文提示词摘要 | 建议路径 |
| --- | --- | --- | --- | --- |
| 待生成 | intro_prison.mp4 | 第一章过场 | Camera slowly pushes into an ancient prison cell, candlelight flickers, bamboo slips glow with golden ink. | `public/videos/intro_prison.mp4` |
| 待生成 | intro_three_people.mp4 | 第二章过场 | Three silhouettes appear across a historical street, herbal smoke and mountain mist blend together. | `public/videos/intro_three_people.mp4` |
| 待生成 | intro_cao_mansion.mp4 | 第三章过场 | A lacquered hall opens under bronze lamps, a bamboo scroll lies on a dark desk, tense atmosphere. | `public/videos/intro_cao_mansion.mp4` |
| 待生成 | intro_choice.mp4 | 第四章过场 | A scroll rests between candle flame and shadow, four possible fates ripple across it. | `public/videos/intro_choice.mp4` |
| 待生成 | intro_echo.mp4 | 第五章过场 | Golden ink rises from a fragment, transforms into medicine lights across villages over a thousand years. | `public/videos/intro_echo.mp4` |

## BGM 素材

统一要求：45-90 秒，可循环，无人声歌词，东方幻想叙事风格。

| 状态 | 素材 | 用途 | 提示词摘要 | 建议路径 |
| --- | --- | --- | --- | --- |
| 待生成 | bgm_archive_loop.mp3 | 首页/设定 | guqin, low drone, warm candle ambience, mysterious archive | `public/audio/bgm/archive_loop.mp3` |
| 待生成 | bgm_prison_loop.mp3 | 第一章 | prison night, guqin, soft low strings, candle crackle, quiet tension | `public/audio/bgm/prison_loop.mp3` |
| 待生成 | bgm_investigation_loop.mp3 | 第二章 | investigation, bamboo flute, light percussion, thoughtful mood | `public/audio/bgm/investigation_loop.mp3` |
| 待生成 | bgm_power_loop.mp3 | 第三章 | political pressure, low drums, dark strings, restrained suspense | `public/audio/bgm/power_loop.mp3` |
| 待生成 | bgm_choice_loop.mp3 | 第四章 | final decision, sparse guqin, heartbeat-like percussion, emotional | `public/audio/bgm/choice_loop.mp3` |
| 待生成 | bgm_echo_loop.mp3 | 第五章/结局 | finale, full theme, guqin, flute, strings, bell, emotional resolution | `public/audio/bgm/echo_loop.mp3` |

## 音效素材

| 状态 | 素材 | 用途 | 提示词摘要 | 建议路径 |
| --- | --- | --- | --- | --- |
| 待生成 | sfx_page_turn.wav | 翻页/继续 | dry bamboo page turn, short, clean | `public/audio/sfx/page_turn.wav` |
| 待生成 | sfx_choice.wav | 选择 | soft ink stamp, subtle impact | `public/audio/sfx/choice.wav` |
| 待生成 | sfx_unlock.wav | 解锁结局 | gentle bell and golden shimmer | `public/audio/sfx/unlock.wav` |
| 待生成 | sfx_fire.wav | 焚书结局 | small candle flame catching dry bamboo | `public/audio/sfx/fire.wav` |
