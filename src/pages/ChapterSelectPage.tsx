import { useState } from "react";
import { Topbar, SealTag, LockedDungeon } from "../components";
import { Particles, SceneClinic } from "../components/art";

interface ChapterSelectPageProps {
  onBack: () => void;
  onEnter: () => void;
}

/** Overlay the AI-generated dungeon cover image on top of the SVG scene */
function DungeonCoverImage() {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src="/images/levels/1/chapters/dungeon_cover_huatuo.webp"
      alt="华佗·青囊残卷 副本封面"
      onLoad={() => setLoaded(true)}
      onError={() => setLoaded(false)}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        opacity: loaded ? 1 : 0,
        transition: "opacity 360ms ease",
        zIndex: 1,
        pointerEvents: "none",
      }}
    />
  );
}

export function ChapterSelectPage({ onBack, onEnter }: ChapterSelectPageProps) {
  const locked = [
    { name:"李白·谪仙遗恨", brief:"长安一片月，万户不敢扣门。" },
    { name:"岳飞·风波未平", brief:"风波亭外，何人为他递一柄伞。" },
    { name:"梁祝·化蝶之前", brief:"未化蝶前，他们还有最后一次开口。" },
    { name:"孟姜女·长城悲歌", brief:"她不必哭倒长城，只想认回一具骨。" },
  ];
  return (
    <div className="page night-bg">
      <Topbar title="副 本 · 典 籍" onBack={onBack}/>
      <Particles count={8}/>

      <div className="page-scroll" style={{top: 56, bottom: 0, padding: "0 16px calc(28px + var(--safe-bottom))"}}>
        <div className="fade-in" style={{marginBottom: 22}}>
          <div style={{
            position:"relative", overflow:"hidden",
            borderRadius: 2,
            border: "1px solid rgba(205,178,119,0.6)",
            boxShadow: "0 0 0 1px rgba(236,220,166,0.18), 0 12px 32px rgba(0,0,0,0.6), inset 0 0 60px rgba(236,220,166,0.08)",
          }}>
            <div style={{position:"relative", height: 200}}>
              <SceneClinic/>
              <DungeonCoverImage/>
              <div className="grain"/>
              <div className="vignette"/>
              <Particles count={12}/>
              <div style={{
                position:"absolute", left: 16, top: 14,
                fontFamily:"ZCOOL XiaoWei, serif",
                fontSize: 12, color:"var(--gold-pale)",
                letterSpacing:"0.4em", opacity: 0.85,
              }}>EPISODE · 壹</div>
              <div style={{position:"absolute", right: 12, top: 12}}>
                <SealTag size="sm" style={{transform:"rotate(4deg)"}}>启</SealTag>
              </div>
            </div>
            <div style={{
              padding: "14px 16px 16px",
              background: "linear-gradient(180deg, rgba(9,14,17,0.95), rgba(5,8,11,0.98))",
              borderTop: "1px solid rgba(205,178,119,0.3)",
            }}>
              <div className="title-han" style={{
                fontSize: 22, color:"var(--gold-pale)",
                letterSpacing:"0.22em", textIndent:"0.22em",
                marginBottom: 8,
                textShadow: "0 0 14px rgba(236,220,166,0.3)",
              }}>华佗 · 青囊残卷</div>
              <div style={{
                fontSize: 12.5, lineHeight: 1.8,
                opacity: 0.82,
                color:"rgba(228,224,208,0.9)",
                marginBottom: 14,
                letterSpacing:"0.04em",
              }}>
                建安年间，华佗将死，《青囊经》即将失传。<br/>
                你醒来时，成了华佗身边最不起眼的小徒弟。<br/>
                你不能救他，但你还有一夜，可以决定医道是否断绝。
              </div>
              <button className="btn-primary press" onClick={onEnter} style={{width: "100%"}}>
                进 入 此 卷
              </button>
            </div>
          </div>
        </div>

        <div style={{
          textAlign:"center", marginBottom: 12,
          fontFamily:"ZCOOL XiaoWei, serif",
          fontSize: 12, color:"rgba(236,220,166,0.5)",
          letterSpacing:"0.5em", textIndent:"0.5em",
        }}>· 未 启 之 卷 ·</div>

        <div style={{display:"flex", flexDirection:"column", gap: 10}}>
          {locked.map((l, i) => (
            <div key={i} className="fade-up" style={{animationDelay: `${i*60}ms`}}>
              <LockedDungeon title={l.name} subtitle={l.brief}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
