/**
 * 物品登记表：state.items 里的物品 id → 展示名称、图标、描述。
 * 图标为 v3 预生成的道具图（public/images/levels/1/items/ch1/）。
 * 探索热点旁白「获得：<名>」通过 ITEM_NAME_TO_ID 映射到 id，真正写入 state.items。
 */
export interface ItemDef {
  id: string;
  name: string;
  image?: string;
  desc?: string;
}

const IMG = "/images/levels/1/items/ch1";

export const ITEMS: Record<string, ItemDef> = {
  cloth_strip:        { id: "cloth_strip", name: "破布条", image: `${IMG}/item_cloth_strip.webp`, desc: "可临时捆扎残页，搜身时也能作一点补救。" },
  rusty_key:          { id: "rusty_key", name: "生锈铜钥匙", image: `${IMG}/item_rusty_key.webp`, desc: "墙角稻草下藏着的旧钥匙，似与木盒机关相关。" },
  scattered_bamboo:   { id: "scattered_bamboo", name: "散落竹简", image: `${IMG}/item_scattered_bamboo.webp`, desc: "《青囊经》断裂的竹简，病症、医理、药方混在一处。" },
  old_healer_clothes: { id: "old_healer_clothes", name: "旧药童衣", image: `${IMG}/item_old_healer_clothes.webp`, desc: "从前送药时穿的旧衣，能让阿吉像个还能被差遣的药童。" },
  entry_pass:         { id: "entry_pass", name: "半张路引", image: `${IMG}/item_entry_pass.webp`, desc: "路引还缺华佗印记，暂时不能用。" },
  qingsang_fragment:  { id: "qingsang_fragment", name: "青囊残页", image: `${IMG}/item_qingsang_fragment.webp`, desc: "重新拼合的残页，是接过医道的资格。" },
  wooden_box_set:     { id: "wooden_box_set", name: "藏卷木盒", image: `${IMG}/item_wooden_box_set.webp`, desc: "暗格机关木盒，可藏青囊残页。" },

  // 后续章节物品（暂无专属图标，用默认印记展示）
  travel_pass:         { id: "travel_pass", name: "药童路引", desc: "补过华佗印记的路引，能解释阿吉为何能在城中短时间行动。" },
  wooden_box:          { id: "wooden_box", name: "藏卷木盒" },
  chenbo_prescription: { id: "chenbo_prescription", name: "陈伯药签" },
  chenbo_prescription_full: { id: "chenbo_prescription_full", name: "完整药签" },
  wangji_document:     { id: "wangji_document", name: "曹府问诊录" },
  wangji_fake_doc:     { id: "wangji_fake_doc", name: "假文书" },
  xuanyin_song_page:   { id: "xuanyin_song_page", name: "玄音歌页" },
  xuanyin_song_page_complete: { id: "xuanyin_song_page_complete", name: "完整歌页" },
  forbidden_record:    { id: "forbidden_record", name: "禁录" },
};

/** 探索旁白「获得：<名>」→ item id（名称取「获得：」后、「。」前，可用「、」分隔多件）。 */
export const ITEM_NAME_TO_ID: Record<string, string> = {
  "破布条": "cloth_strip",
  "生锈铜钥匙": "rusty_key",
  "散落竹简": "scattered_bamboo",
  "旧药童衣": "old_healer_clothes",
  "半张路引": "entry_pass",
  "路引": "entry_pass",
  "药童路引": "travel_pass",
  "青囊残页": "qingsang_fragment",
};

/** 从一段「获得：A、B。…」旁白里解析出可入库的 item id 列表。 */
export function parseGainedItemIds(line: string): string[] {
  const m = line.match(/^获得[:：]\s*([^。\n]+)/);
  if (!m) return [];
  return m[1]
    .split(/[、，,]/)
    .map(s => ITEM_NAME_TO_ID[s.trim()])
    .filter((id): id is string => !!id);
}
