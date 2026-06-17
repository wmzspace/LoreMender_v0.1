import type { Beat } from "../../types";

/**
 * 为「原始」beat 树中每条带 line 的 beat 分配一个稳定下标，用作配音文件名
 * （public/audio/levels/1/dialogue/ch<N>/<idx>.mp3）。
 *
 * 采用全量 DFS：深入所有 ifKey 分支（两个 ifVal 变体都遍历），且与运行时 state 无关。
 * 因此无论小游戏后条件 beat 是否展开，同一条台词的下标始终不变——
 * 生成脚本与运行时（StoryPage）共用本函数，保证「文件名」与「播放时取用」永远对齐。
 *
 * 注：flattenBeats 返回的是原始 beat 对象的引用，故运行时可用本 Map 直接查到下标。
 */
export function buildAudioIndex(beats: Beat[]): Map<Beat, number> {
  const map = new Map<Beat, number>();
  let i = 0;
  const walk = (bs: Beat[]) => {
    for (const b of bs) {
      if ("ifKey" in b) {
        walk((b as unknown as { beats: Beat[] }).beats);
        continue;
      }
      if ("line" in b) map.set(b, i++);
    }
  };
  walk(beats);
  return map;
}
