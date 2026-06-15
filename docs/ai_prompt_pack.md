# AI 素材提示词包

> 使用方式：用比赛要求或允许的 AI 工具生成素材；每次生成后，把工具名、提示词、生成时间、采纳文件、人工修改写回 `docs/asset_generation_log.md`，并把关键对话整理到 `docs/ai_dialogue_history.md`。

## 统一美术风格

```text
Use case: stylized-concept
Asset type: game environment concept art
Style/medium: 2D hand-painted Chinese historical fantasy game background, ink wash accents, delicate paper texture, subtle gold particles
Composition/framing: cinematic 16:9, mobile narrative game scene, clear focal area, readable at small size
Lighting/mood: warm candle light against deep night shadow, restrained emotional atmosphere
Color palette: ink black, warm candle amber, aged paper, muted vermillion, pale gold
Constraints: no text, no watermark, no UI, no modern objects, no logos, no exaggerated fantasy armor
```

## 五章插图提示词

### 1. 牢狱初醒

```text
Use case: stylized-concept
Asset type: game environment concept art
Primary request: ancient Xuchang prison at night, candlelight, damp stone wall, scattered bamboo slips
Subject: an elderly healer silhouette assembling bamboo scrolls, a young apprentice waking nearby
Style/medium: 2D hand-painted Chinese historical fantasy, ink wash texture, subtle gold particles
Composition/framing: cinematic 16:9, the candle and scroll are the focal point, enough dark space for dialogue UI
Lighting/mood: warm candle against deep blue-black prison shadow, quiet tension
Constraints: no text, no watermark, no UI, no modern objects
```

### 2. 三人之试

```text
Use case: stylized-concept
Asset type: game environment concept art
Primary request: late Han dynasty street with herbal smoke, distant military gate and misty mountain path blended as symbolic layers
Subject: three candidate silhouettes: a camp official, a village healer, a mountain Taoist
Style/medium: 2D hand-painted Chinese historical fantasy, delicate paper texture, ink wash accents
Composition/framing: wide 16:9, triptych-like layout with three readable silhouettes
Lighting/mood: morning haze, investigative, uncertain
Constraints: no text, no watermark, no UI, no modern objects
```

### 3. 曹府密谈

```text
Use case: stylized-concept
Asset type: game environment concept art
Primary request: Cao Cao's lacquered hall under bronze lamps, dark desk, bamboo scroll on the table
Subject: oppressive ruler silhouette above a small apprentice figure
Style/medium: cinematic 2D Chinese historical fantasy concept art, ink wash and lacquer texture
Composition/framing: 16:9 low-angle hall composition, strong perspective toward the desk
Lighting/mood: bronze lamp glow, political pressure, suspense
Constraints: no text, no watermark, no UI, no modern objects
```

### 4. 青囊抉择

```text
Use case: stylized-concept
Asset type: game environment concept art
Primary request: prison cell at deep night, last candle, bamboo scroll fragment on a rough table
Subject: four faint fate reflections on the scroll: village medicine, mountain archive, locked private library, rising flame
Style/medium: 2D hand-painted Chinese fantasy, ink wash, gold dust
Composition/framing: 16:9 close cinematic composition, scroll as focal point
Lighting/mood: emotional final decision, warm candle and cold shadow
Constraints: no text, no watermark, no UI, no modern objects
```

### 5. 千年回响

```text
Use case: stylized-concept
Asset type: game environment concept art
Primary request: golden ink rising from a bamboo fragment and spreading across villages, clinics, mountains and books over a thousand years
Subject: medicine lights carried by ordinary people, faint healer silhouette in the background
Style/medium: 2D hand-painted Chinese historical fantasy, ink wash, delicate paper texture, luminous gold particles
Composition/framing: wide 16:9 finale composition with upward motion
Lighting/mood: emotional resolution, warm dawn, hopeful
Constraints: no text, no watermark, no UI, no modern objects
```

## 视频提示词

统一要求：6-10 秒，16:9，轻镜头运动，无文字、无水印、无 UI。

```text
1. Camera slowly pushes into an ancient prison cell, candlelight flickers, bamboo slips glow with golden ink, ink dust floating in the air, Chinese historical fantasy, no text, no watermark.

2. Three silhouettes appear one by one across a historical street, herbal smoke and mountain mist blend together, golden ink lines connect them to one bamboo scroll, no text, no watermark.

3. A lacquered hall opens under bronze lamps, a bamboo scroll lies on a dark desk, shadows stretch like pressure around a small apprentice, no text, no watermark.

4. A scroll rests between candle flame and shadow, four possible fates ripple across it: village light, mountain mist, locked archive, fire ash, no text, no watermark.

5. Golden ink rises from a fragment, transforms into medicine lights across villages over a thousand years, dawn light opens through paper texture, no text, no watermark.
```

## BGM 提示词

统一要求：45-90 秒，可循环，无人声歌词，不使用受版权保护旋律。

```text
archive_loop.mp3: mysterious archive, guqin, low drone, warm candle ambience, subtle bell, loopable instrumental, no vocals.

prison_loop.mp3: ancient prison night, guqin, low strings, soft wind, candle crackle, restrained tension, loopable instrumental, no vocals.

investigation_loop.mp3: investigation mood, bamboo flute, light wooden percussion, guqin plucks, thoughtful and restrained, loopable instrumental, no vocals.

power_loop.mp3: political pressure, low drums, dark bowed strings, sparse guqin, tense but elegant Chinese historical suspense, loopable instrumental, no vocals.

choice_loop.mp3: final decision, sparse guqin, heartbeat-like muted percussion, low flute, emotional and tense, loopable instrumental, no vocals.

echo_loop.mp3: finale theme, guqin, xiao flute, soft strings, bell shimmer, emotional resolution, hopeful but restrained, loopable instrumental, no vocals.
```

## 音效提示词

```text
page_turn.wav: dry bamboo page turn, short, clean, close microphone, no reverb tail.
choice.wav: soft ink stamp on paper, subtle impact, warm wood resonance, short UI feedback.
unlock.wav: gentle bell and golden shimmer, magical but restrained, short reward sound.
fire.wav: small candle flame catching dry bamboo, soft crackle, no explosion, short.
```

## 文件落地路径

| 类型 | 路径 |
| --- | --- |
| 章节插图 | `public/images/levels/` |
| 章节视频 | `public/videos/` |
| BGM | `public/audio/bgm/` |
| 音效 | `public/audio/sfx/` |
| 生成记录 | `docs/asset_generation_log.md` |
| 对话历史 | `docs/ai_dialogue_history.md` |

