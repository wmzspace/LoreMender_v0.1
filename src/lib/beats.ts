/**
 * ifKey 分支匹配：默认字符串精确相等；ifCmp="gte"/"lte" 时按数值阈值比较。
 * 用于 medical_skill 等累加值（可达 2~4），避免「=== "1"」这类精确相等在累加后漏判。
 * StoryPage.flattenBeats 与 TrustRoutePage.resumeIndexAfterTrust 必须共用此逻辑，保证展开一致。
 */
export function matchIf(
  stateValue: unknown,
  ifVal: string,
  cmp: "eq" | "gte" | "lte" = "eq",
): boolean {
  if (cmp === "eq") return String(stateValue ?? "") === ifVal;
  const a = Number(stateValue ?? 0);
  const b = Number(ifVal);
  return cmp === "gte" ? a >= b : a <= b;
}
