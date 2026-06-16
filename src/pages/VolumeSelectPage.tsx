import { Topbar } from "../components";

interface VolumeSelectPageProps {
  onBack: () => void;
  onEnterFirst: () => void;
}

const VOLUMES = [
  {
    num: "第一卷",
    title: "青囊残卷",
    subtitle: "华佗 · 许昌大牢",
    desc: "医书将焚，残术待传。进入后展开本卷五章剧情。",
    image: "/images/levels/1/chapters/dungeon_cover_huatuo.webp",
    open: true,
  },
  { num: "第二卷", title: "桃园余义", subtitle: "关羽 · 信义残篇", desc: "尚未开放", image: "/images/cover.jpg", open: false },
  { num: "第三卷", title: "兰亭佚笔", subtitle: "王羲之 · 笔墨残影", desc: "尚未开放", image: "/images/cover.jpg", open: false },
  { num: "第四卷", title: "易安旧词", subtitle: "李清照 · 词稿遗声", desc: "尚未开放", image: "/images/cover.jpg", open: false },
  { num: "第五卷", title: "河山遗响", subtitle: "岳飞 · 丹心余烬", desc: "尚未开放", image: "/images/cover.jpg", open: false },
];

export function VolumeSelectPage({ onBack, onEnterFirst }: VolumeSelectPageProps) {
  return (
    <div className="page night-bg">
      <Topbar title="典故卷宗" onBack={onBack} />
      <div className="vignette" />
      <div className="page-scroll" style={{ top: 56, bottom: 0, padding: "0 16px calc(24px + var(--safe-bottom))" }}>
        <div style={{ textAlign: "center", margin: "8px 0 16px" }}>
          <div className="en-small" style={{ color: "var(--gold-pale)", opacity: 0.62, letterSpacing: "0.28em" }}>LORE VOLUMES</div>
          <div className="title-han" style={{ color: "var(--gold-pale)", fontSize: 24, marginTop: 7 }}>五卷待修</div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {VOLUMES.map((vol) => (
            <button
              key={vol.num}
              className="press"
              onClick={vol.open ? onEnterFirst : undefined}
              disabled={!vol.open}
              style={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: "88px 1fr",
                gap: 12,
                textAlign: "left",
                border: `1px solid ${vol.open ? "rgba(205,178,119,0.42)" : "rgba(228,224,208,0.12)"}`,
                background: vol.open ? "rgba(10,16,20,0.72)" : "rgba(10,16,20,0.36)",
                borderRadius: 4,
                padding: 10,
                color: "var(--paper)",
                opacity: vol.open ? 1 : 0.52,
                cursor: vol.open ? "pointer" : "default",
              }}
            >
              <div style={{
                height: 92,
                borderRadius: 3,
                overflow: "hidden",
                background: "#080d10",
                border: "1px solid rgba(205,178,119,0.18)",
              }}>
                <img src={vol.image} alt={vol.title} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: vol.open ? 0.92 : 0.45 }} />
              </div>
              <div style={{ minWidth: 0, alignSelf: "center" }}>
                <div style={{ fontSize: 11, color: "var(--gold-pale)", opacity: 0.62, letterSpacing: "0.18em" }}>{vol.num}</div>
                <div className="title-han" style={{ color: vol.open ? "var(--gold-pale)" : "var(--paper)", fontSize: 18, marginTop: 4 }}>
                  {vol.title}
                </div>
                <div style={{ fontSize: 11, opacity: 0.58, marginTop: 3 }}>{vol.subtitle}</div>
                <div style={{ fontSize: 12, lineHeight: 1.55, opacity: 0.74, marginTop: 8 }}>{vol.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
