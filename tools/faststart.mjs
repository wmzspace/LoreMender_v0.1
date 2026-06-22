// 纯 Node 版 qt-faststart：把 mp4 的 moov atom 移到 mdat 之前(faststart)，
// 并把 moov 内 stco/co64 的 chunk 绝对偏移整体 += moovSize(因为 mdat 整体后移了 moovSize)。
// 用法: node tools/faststart.mjs <in.mp4> <out.mp4>
import { readFileSync, writeFileSync } from "node:fs";

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) { console.error("usage: faststart.mjs <in> <out>"); process.exit(1); }

const buf = readFileSync(inPath);

/** 解析一段 buffer 内的顶层 atom 列表 [{type,start,end,headerSize}]。 */
function parseAtoms(b, base = 0, end = b.length) {
  const out = [];
  let p = base;
  while (p + 8 <= end) {
    let size = b.readUInt32BE(p);
    let headerSize = 8;
    if (size === 1) { size = Number(b.readBigUInt64BE(p + 8)); headerSize = 16; }
    else if (size === 0) { size = end - p; }
    if (size < headerSize || p + size > end) break;
    out.push({ type: b.toString("latin1", p + 4, p + 8), start: p, end: p + size, headerSize });
    p += size;
  }
  return out;
}

const CONTAINERS = new Set(["moov", "trak", "edts", "mdia", "minf", "dinf", "stbl", "mvex", "udta"]);

/** 在 moov buffer 内递归把所有 stco/co64 的偏移 += delta。moovBuf 是独立副本，原地改写。 */
function patchOffsets(moovBuf, delta) {
  let patched = 0;
  const walk = (start, end) => {
    for (const a of parseAtoms(moovBuf, start, end)) {
      if (a.type === "stco") {
        const n = moovBuf.readUInt32BE(a.start + a.headerSize + 4);
        let o = a.start + a.headerSize + 8;
        for (let i = 0; i < n; i++, o += 4) {
          moovBuf.writeUInt32BE(moovBuf.readUInt32BE(o) + delta, o);
        }
        patched += n;
      } else if (a.type === "co64") {
        const n = moovBuf.readUInt32BE(a.start + a.headerSize + 4);
        let o = a.start + a.headerSize + 8;
        for (let i = 0; i < n; i++, o += 8) {
          moovBuf.writeBigUInt64BE(moovBuf.readBigUInt64BE(o) + BigInt(delta), o);
        }
        patched += n;
      } else if (CONTAINERS.has(a.type)) {
        walk(a.start + a.headerSize, a.end);
      }
    }
  };
  walk(0, moovBuf.length);
  return patched;
}

const atoms = parseAtoms(buf);
const moov = atoms.find(a => a.type === "moov");
const mdat = atoms.find(a => a.type === "mdat");
if (!moov || !mdat) { console.error("no moov/mdat"); process.exit(1); }
if (moov.start < mdat.start) { console.log("already faststart, copying as-is"); writeFileSync(outPath, buf); process.exit(0); }

const moovBuf = Buffer.from(buf.subarray(moov.start, moov.end)); // 独立副本再改写
const moovSize = moov.end - moov.start;
const patched = patchOffsets(moovBuf, moovSize);

// 重组：moov 之前的部分(ftyp/uuid/mdat 等，按原顺序但去掉末尾 moov) → 末尾的 moov 抽出插到 mdat 前。
// 已知布局 ftyp,uuid,mdat,moov：pre = [moov.start 之前的所有字节]，新文件 = pre前段(到 mdat 前) + moov + mdat..moov前。
// 通用做法：把除 moov 外的其余字节按原顺序拼接，并在第一个 mdat 之前插入 moov。
const parts = [];
for (const a of atoms) {
  if (a.type === "moov") continue;
  if (a.type === "mdat") parts.push(moovBuf); // 在 mdat 前插入 moov
  parts.push(buf.subarray(a.start, a.end));
}
const out = Buffer.concat(parts);

// 校验：大小不变 + 顶层顺序 moov 在 mdat 前 + 首个 stco 偏移落在新 mdat 范围内。
const outAtoms = parseAtoms(out);
const oMoov = outAtoms.find(a => a.type === "moov");
const oMdat = outAtoms.find(a => a.type === "mdat");
const firstStco = (() => {
  let v = null;
  const walk = (start, e) => { for (const a of parseAtoms(out, start, e)) {
    if (a.type === "stco" && v === null) v = out.readUInt32BE(a.start + a.headerSize + 8);
    else if (CONTAINERS.has(a.type)) walk(a.start + a.headerSize, a.end);
  } };
  walk(oMoov.start + oMoov.headerSize, oMoov.end);
  return v;
})();

const ok = out.length === buf.length && oMoov.start < oMdat.start
  && firstStco !== null && firstStco >= oMdat.start + oMdat.headerSize && firstStco < oMdat.end;
console.log(JSON.stringify({
  inSize: buf.length, outSize: out.length, moovSize, patchedChunks: patched,
  order: outAtoms.map(a => a.type).join(","),
  firstStco, mdatRange: [oMdat.start + oMdat.headerSize, oMdat.end], ok,
}, null, 2));
if (!ok) { console.error("VALIDATION FAILED — not writing"); process.exit(2); }
writeFileSync(outPath, out);
console.log("wrote", outPath);
