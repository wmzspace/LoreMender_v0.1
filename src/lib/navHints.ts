/**
 * 一次性跨页面导航提示：极简内存标记，读一次就清空，不进 GameState/localStorage。
 * 目前只用于「结局页点下一章 → 典故卷宗页自动平滑滚到下一卷」这一种场景。
 */
let _scrollToNextVolume = false;

export function requestScrollToNextVolume(): void {
  _scrollToNextVolume = true;
}

export function consumeScrollToNextVolume(): boolean {
  const v = _scrollToNextVolume;
  _scrollToNextVolume = false;
  return v;
}
