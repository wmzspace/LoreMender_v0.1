/* ============================================================
   pages.jsx — page components for each screen
   ============================================================ */

// ============================================================
// 1. CoverPage — 启动页
// ============================================================
function CoverPage({ onStart, onWorld }) {
  return (
    <div className="page night-deep-bg" style={{position:"relative"}}>
      {/* Big atmospheric art */}
      <div style={{position:"absolute", inset: 0}}>
        <CoverArt/>
      </div>
      <Particles count={18}/>
      <div className="grain"/>
      <div className="vignette"/>

      {/* Content over art */}
      <div style={{
        position:"relative", zIndex: 2,
        flex: 1, display:"flex", flexDirection:"column",
        padding: "calc(50px + env(safe-area-inset-top, 0px)) 28px calc(28px + var(--safe-bottom))",
      }}>
        {/* English small */}
        <div className="ink-in" style={{textAlign:"center"}}>
          <div className="en-small" style={{fontSize: 11, color:"rgba(231,199,115,0.7)", marginBottom: 12}}>
            The Lore Mender
          </div>
        </div>

        {/* Main title */}
        <div className="fade-up" style={{textAlign:"center", animationDelay:"120ms"}}>
          <div className="title-han" style={{
            fontSize: 38, color:"var(--gold-pale)",
            letterSpacing: "0.32em", textIndent: "0.32em",
            textShadow: "0 0 24px rgba(231,199,115,0.5), 0 2px 4px rgba(0,0,0,0.8)",
            fontWeight: 500,
          }}>典故修补者</div>

          <div style={{
            display:"inline-flex", alignItems:"center", gap: 12,
            marginTop: 14, color:"var(--paper)",
          }}>
            <span style={{width:24, height:1, background:"var(--gold-pale)", opacity: 0.6}}/>
            <span className="title-han" style={{
              fontSize: 18, letterSpacing:"0.5em", textIndent:"0.5em",
              color:"var(--paper)", opacity: 0.95,
            }}>青囊残卷</span>
            <span style={{width:24, height:1, background:"var(--gold-pale)", opacity: 0.6}}/>
          </div>
        </div>

        <div style={{flex: 1, minHeight: 60}}/>

        {/* Tagline */}
        <div className="fade-up" style={{
          textAlign:"center", marginBottom: 24,
          animationDelay:"400ms",
        }}>
          <div className="title-han" style={{
            fontSize: 14, color:"rgba(231,199,115,0.9)",
            letterSpacing:"0.5em", textIndent:"0.5em",
            marginBottom: 16,
          }}>穿越典故 · 修补遗憾</div>
          <div style={{
            fontSize: 12.5, lineHeight: 1.85, opacity: 0.78,
            maxWidth: 300, margin: "0 auto",
            color:"rgba(235,217,179,0.9)",
            letterSpacing: "0.06em",
          }}>
            你进入被遗忘的典故世界，附身关键人物，<br/>
            在无法改写命运的限制下，<br/>
            修补那些被历史掩埋的遗憾。
          </div>
        </div>

        {/* Buttons */}
        <div className="fade-up" style={{
          display:"flex", flexDirection:"column", gap: 12,
          animationDelay:"600ms",
        }}>
          <button className="btn-primary press" onClick={onStart}>开 始 修 补</button>
          <button className="btn-ghost press" onClick={onWorld}>查 看 设 定</button>
        </div>

        {/* Foot note */}
        <div style={{
          textAlign:"center", marginTop: 18,
          fontSize: 10, opacity: 0.4, letterSpacing:"0.4em",
        }}>建安二十五年 · 青史空间</div>
      </div>
    </div>
  );
}

// ============================================================
// 2. WorldPage — 世界观设定页
// ============================================================
function WorldPage({ onBack, onEnter }) {
  const cards = [
    { key:"space", title:"青史空间", line:"所有流传下来的典故，都会在这里形成投影。" },
    { key:"pollution", title:"历史污染", line:"误传、遗忘和篡改，让许多人物的真实情感被掩埋。" },
    { key:"mender", title:"修补者", line:"你不是上帝，不能随意改写生死。" },
    { key:"rule", title:"修补原则", line:"不能强行逆天改命，只能让被遮蔽的价值重新被看见。" },
  ];
  return (
    <div className="page night-bg">
      <Topbar title="设 定" onBack={onBack}/>
      <Particles count={10}/>

      <div className="page-scroll" style={{top: 56, bottom: 92, padding: "0 16px"}}>
        <div className="fade-in" style={{textAlign:"center", marginBottom: 18}}>
          <div className="en-small" style={{fontSize: 10, opacity: 0.6, color:"var(--gold-pale)"}}>
            Lore · Codex
          </div>
          <div className="title-han" style={{
            fontSize: 22, color:"var(--gold-pale)", marginTop: 6,
            letterSpacing:"0.3em", textIndent:"0.3em",
          }}>典 籍 设 定</div>
        </div>

        <div style={{display:"flex", flexDirection:"column", gap: 14, paddingBottom: 24}}>
          {cards.map((c, i) => (
            <div key={c.key} className="fade-up"
                 style={{animationDelay: `${i*90}ms`}}>
              <PaperPanel style={{padding: "14px 16px 16px"}}>
                <div style={{display:"flex", gap: 14, alignItems:"flex-start"}}>
                  <div style={{
                    width: 60, height: 60, flexShrink: 0,
                    background:"radial-gradient(circle at 50% 50%, rgba(168,49,31,0.15), transparent 70%)",
                    border:"1px solid rgba(78,58,20,0.4)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    <WorldIcon type={c.key}/>
                  </div>
                  <div style={{flex: 1}}>
                    <div className="title-han" style={{
                      fontSize: 17, color:"var(--ink-deep)",
                      letterSpacing:"0.22em", textIndent:"0.22em",
                      marginBottom: 8,
                      borderBottom: "1px solid rgba(78,58,20,0.25)",
                      paddingBottom: 6,
                    }}>{c.title}</div>
                    <div style={{
                      fontSize: 13.5, lineHeight: 1.75,
                      color: "var(--ink)",
                      letterSpacing: "0.04em",
                    }}>{c.line}</div>
                  </div>
                </div>
              </PaperPanel>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div style={{
        position:"absolute", left: 0, right: 0, bottom: 0,
        padding: `12px 20px calc(16px + var(--safe-bottom))`,
        background: "linear-gradient(180deg, transparent, rgba(10,6,4,0.95) 30%)",
      }}>
        <button className="btn-primary press" onClick={onEnter} style={{width: "100%"}}>
          进 入 副 本
        </button>
      </div>
    </div>
  );
}

// ============================================================
// 3. ChapterSelectPage — 副本选择
// ============================================================
function ChapterSelectPage({ onBack, onEnter }) {
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
        {/* Featured open dungeon */}
        <div className="fade-in" style={{marginBottom: 22}}>
          <div style={{
            position:"relative", overflow:"hidden",
            borderRadius: 2,
            border: "1px solid rgba(201,161,74,0.6)",
            boxShadow: "0 0 0 1px rgba(231,199,115,0.18), 0 12px 32px rgba(0,0,0,0.6), inset 0 0 60px rgba(231,199,115,0.08)",
          }}>
            <div style={{position:"relative", height: 200}}>
              <SceneClinic/>
              <div className="grain"/>
              <div className="vignette"/>
              <Particles count={12}/>
              {/* Title overlay */}
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
            {/* Caption */}
            <div style={{
              padding: "14px 16px 16px",
              background: "linear-gradient(180deg, rgba(15,10,6,0.95), rgba(8,5,3,0.98))",
              borderTop: "1px solid rgba(201,161,74,0.3)",
            }}>
              <div className="title-han" style={{
                fontSize: 22, color:"var(--gold-pale)",
                letterSpacing:"0.22em", textIndent:"0.22em",
                marginBottom: 8,
                textShadow: "0 0 14px rgba(231,199,115,0.3)",
              }}>华佗 · 青囊残卷</div>
              <div style={{
                fontSize: 12.5, lineHeight: 1.8,
                opacity: 0.82,
                color:"rgba(235,217,179,0.9)",
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

        {/* Locked dungeons */}
        <div style={{
          textAlign:"center", marginBottom: 12,
          fontFamily:"ZCOOL XiaoWei, serif",
          fontSize: 12, color:"rgba(231,199,115,0.5)",
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

// ============================================================
// 4. StoryPage — 剧情主界面
// ============================================================
function StoryPage({ state, setState, gotoPage, gotoEnding }) {
  // current chapter (1..4) — 5 is ending
  const ch = state.currentChapter || 1;
  const chKey = "ch" + ch;
  const chapter = STORY[chKey];

  // beat index inside chapter
  const [beatIdx, setBeatIdx] = useState(0);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setBeatIdx(0); // reset when chapter changes
  }, [ch]);

  const beats = chapter?.beats || [];
  const beat = beats[beatIdx];

  const next = () => {
    if (!beat) return;
    if (beat.gotoChapter === "clue") {
      gotoPage("clue");
      return;
    }
    if (beat.gotoChapter) {
      const nextCh = parseInt(beat.gotoChapter.replace("ch",""), 10);
      const ns = { ...state, currentChapter: nextCh };
      setState(ns); saveState(ns);
      setBeatIdx(0);
      return;
    }
    if (beat.gotoTrust) { gotoPage("trust"); return; }
    if (beat.gotoEnding) { gotoEnding(); return; }
    setBeatIdx(i => Math.min(beats.length - 1, i + 1));
  };

  const choose = (c) => {
    if (c.toast) setToast(c.toast);
    let ns = { ...state, ...(c.set || {}) };
    if (c.ending) {
      ns = { ...ns, finalDecision: c.set?.finalDecision || ns.finalDecision };
    }
    setState(ns); saveState(ns);
    // advance to next beat
    setTimeout(() => setBeatIdx(i => Math.min(beats.length - 1, i + 1)), 300);
  };

  // pick scene visual
  const sceneEl = useMemo(() => {
    const s = chapter?.scene;
    if (s === "clinic_night") return <SceneClinic/>;
    if (s === "raid_coming") return <SceneRaid/>;
    if (s === "find_trust") return <SceneTrust/>;
    if (s === "final_choice") return <SceneFinal/>;
    return <SceneClinic/>;
  }, [chapter]);

  return (
    <div className="page night-deep-bg" style={{paddingBottom: 0}}>
      {/* Top bar */}
      <div className="topbar" style={{paddingBottom: 4}}>
        <button className="icon-btn press" onClick={() => gotoPage("dungeon")}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M9 1 L3 7 L9 13" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>
        </button>
        <div className="topbar-title">华佗 · 青囊残卷</div>
        <button className="icon-btn press" onClick={() => gotoPage("map")}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 3 H12 M2 7 H12 M2 11 H12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
        </button>
      </div>
      <ProgressDots total={5} current={ch}/>

      {/* Chapter title strip */}
      <div className="fade-in" style={{
        textAlign:"center", padding:"2px 16px 10px",
      }}>
        <div className="title-han" style={{
          fontSize: 17, color:"var(--gold-pale)",
          letterSpacing:"0.22em", textIndent:"0.22em",
          textShadow: "0 0 10px rgba(231,199,115,0.4)",
        }}>{chapter.title}</div>
      </div>

      {/* Scene illustration */}
      <SceneFrame height={220}>{sceneEl}</SceneFrame>

      {/* Dialogue + choices area (scrollable if needed) */}
      <div style={{
        flex: 1, overflowY:"auto",
        paddingBottom: `calc(20px + var(--safe-bottom) + 64px)`,
      }} className="no-scrollbar">
        <div style={{padding: "16px 0 0"}}>
          {beat?.choices ? (
            <div className="fade-up">
              <div style={{
                padding:"0 18px 8px",
                fontFamily:"ZCOOL XiaoWei, serif",
                fontSize: 12, color:"var(--gold-pale)",
                letterSpacing:"0.36em", textIndent:"0.36em",
                opacity: 0.85, textAlign:"center",
              }}>· 抉 择 ·</div>
              <ChoiceList choices={beat.choices} onChoose={choose}/>
            </div>
          ) : (
            <div className="fade-in">
              <DialogueBox
                speaker={beat?.speaker ? CHARACTERS[beat.speaker]?.name : null}
                text={beat?.line || ""}
                isNarration={!!beat?.narration}
                onTap={next}
              />
              <div style={{
                textAlign:"center", marginTop: 12,
                fontFamily:"ZCOOL XiaoWei, serif",
                fontSize: 11, opacity: 0.5,
                letterSpacing:"0.4em",
              }}>· 轻触 继续 ·</div>
            </div>
          )}
        </div>
      </div>

      <Toast text={toast} onDone={() => setToast("")}/>

      {/* Bottom nav */}
      <div style={{position:"absolute", bottom: 0, left: 0, right: 0}}>
        <BottomNav active="story" onNav={gotoPage}/>
      </div>
    </div>
  );
}

// ============================================================
// 5. CluePage — 调查线索
// ============================================================
function CluePage({ state, setState, gotoPage }) {
  const [active, setActive] = useState(null);

  const toggleCollect = (id) => {
    let cs = state.searchedClues || [];
    if (!cs.includes(id)) {
      cs = [...cs, id];
      const ns = { ...state, searchedClues: cs };
      setState(ns); saveState(ns);
    }
    setActive(id);
  };

  const collected = state.searchedClues || [];
  const enoughClues = collected.length >= 3;

  return (
    <div className="page night-deep-bg">
      <div className="topbar" style={{paddingBottom: 4}}>
        <button className="icon-btn press" onClick={() => gotoPage("story")}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M9 1 L3 7 L9 13" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>
        </button>
        <div className="topbar-title">线 索 板</div>
        <div style={{width:38}}/>
      </div>

      <div className="page-scroll" style={{top: 56, bottom: 64, padding: "0 14px"}}>
        <div className="fade-in" style={{textAlign:"center", marginBottom: 12}}>
          <div className="en-small" style={{fontSize: 10, color:"var(--gold-pale)", opacity: 0.7}}>
            CLUE · BOARD
          </div>
          <div style={{
            fontSize: 12.5, opacity: 0.75, marginTop: 6, lineHeight: 1.7,
            color:"rgba(231,217,179,0.85)", letterSpacing:"0.05em",
          }}>
            医馆里能带走的，从来不止那本残卷。<br/>
            点开纸片，看看你还记得什么。
          </div>
        </div>

        {/* Clue grid — paper-pinned style */}
        <div style={{
          position:"relative", padding: "10px 0",
          background: "linear-gradient(180deg, rgba(20,14,8,0.5), rgba(8,5,3,0.5))",
          border: "1px dashed rgba(201,161,74,0.25)",
          borderRadius: 2,
        }}>
          <div style={{
            display:"grid", gridTemplateColumns:"1fr 1fr",
            gap: 12, padding: 12,
          }}>
            {CLUES.map((c, i) => {
              const has = collected.includes(c.id);
              const rot = (i % 2 === 0 ? -2 : 2) + (i % 3 === 0 ? -1 : 1);
              return (
                <button key={c.id} className="press"
                  onClick={() => toggleCollect(c.id)}
                  style={{
                    position:"relative",
                    background:"linear-gradient(180deg, #f0dcae, #d8be88)",
                    color:"var(--ink-deep)",
                    border:"1px solid rgba(78,58,20,0.5)",
                    padding: "10px 10px 12px",
                    transform: `rotate(${rot}deg)`,
                    cursor:"pointer",
                    boxShadow:"0 6px 18px rgba(0,0,0,0.55)",
                    minHeight: 130,
                    display:"flex", flexDirection:"column", alignItems:"center",
                    gap: 6,
                    animation: `fadeInUp 350ms ease both ${i*70}ms`,
                  }}>
                  {/* push-pin */}
                  <div style={{
                    position:"absolute", top: -6, left: "50%",
                    transform: "translateX(-50%)",
                    width: 12, height: 12, borderRadius:"50%",
                    background:"radial-gradient(circle at 30% 30%, #ff7050, #6b1a10)",
                    boxShadow:"0 2px 4px rgba(0,0,0,0.5)",
                  }}/>
                  <div style={{
                    width: 56, height: 56,
                    display:"flex", alignItems:"center", justifyContent:"center",
                  }}>
                    <ClueIcon type={c.icon}/>
                  </div>
                  <div style={{
                    fontFamily:"ZCOOL XiaoWei, serif",
                    fontSize: 14, letterSpacing:"0.16em",
                    color:"var(--ink-deep)",
                  }}>{c.name}</div>
                  {has ? (
                    <div style={{
                      fontSize: 10, color:"var(--vermillion)",
                      letterSpacing:"0.18em", marginTop: 2,
                    }}>· 已 阅 ·</div>
                  ) : (
                    <div style={{
                      fontSize: 10, color:"rgba(78,58,20,0.5)",
                      letterSpacing:"0.18em", marginTop: 2,
                    }}>· 未 阅 ·</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Unlock hint */}
        <div className="fade-in" style={{
          margin: "18px 0 12px",
          padding: "14px 16px",
          textAlign: "center",
          background: enoughClues
            ? "linear-gradient(180deg, rgba(231,199,115,0.18), rgba(40,30,18,0.6))"
            : "linear-gradient(180deg, rgba(40,30,18,0.4), rgba(20,14,8,0.6))",
          border: "1px solid " + (enoughClues ? "var(--gold-pale)" : "rgba(78,58,20,0.5)"),
          borderRadius: 2,
        }}>
          {enoughClues ? (
            <div style={{
              fontFamily:"ZCOOL XiaoWei, serif",
              fontSize: 14, color:"var(--gold-pale)",
              letterSpacing:"0.18em", lineHeight: 1.7,
              textShadow:"0 0 12px rgba(231,199,115,0.3)",
            }}>
              也许真正该留下的，<br/>不是原卷，而是知识的活路。
            </div>
          ) : (
            <div style={{
              fontSize: 12, color:"rgba(235,217,179,0.6)",
              lineHeight: 1.7, letterSpacing:"0.06em",
            }}>
              已收集 {collected.length} / {CLUES.length}<br/>
              收集 3 条以上线索，会有新的领悟。
            </div>
          )}
        </div>

        {/* Continue button */}
        <button className="btn-primary press" style={{width:"100%", marginTop: 6}}
          onClick={() => {
            // advance to chapter 3 if currently at ch2
            let ns = state;
            if (state.currentChapter === 2) {
              ns = { ...state, currentChapter: 3 };
              setState(ns); saveState(ns);
            }
            gotoPage("story");
          }}>
          回 到 医 馆
        </button>
      </div>

      <BottomSheet open={!!active} onClose={() => setActive(null)}>
        {active && (() => {
          const c = CLUES.find(x => x.id === active);
          return (
            <div>
              <div style={{display:"flex", alignItems:"center", gap: 12, marginBottom: 10}}>
                <div style={{
                  width: 48, height: 48,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  background:"rgba(168,49,31,0.1)",
                  border:"1px solid rgba(78,58,20,0.4)",
                }}>
                  <ClueIcon type={c.icon} size={40}/>
                </div>
                <div>
                  <div className="title-han" style={{
                    fontSize: 17, color:"var(--ink-deep)",
                    letterSpacing:"0.16em",
                  }}>{c.title}</div>
                  <div style={{fontSize: 11, color:"rgba(78,58,20,0.7)", marginTop: 2, letterSpacing:"0.12em"}}>
                    · 线索 · {c.name}
                  </div>
                </div>
              </div>
              <GoldDivider/>
              <div style={{
                whiteSpace:"pre-line",
                fontSize: 14, lineHeight: 1.85,
                color:"var(--ink)",
                letterSpacing:"0.04em",
                fontStyle:"italic",
                padding:"8px 4px",
              }}>{c.body}</div>
              <div style={{
                marginTop: 12, padding: "10px 12px",
                background: "rgba(168,49,31,0.08)",
                borderLeft: "2px solid var(--vermillion)",
                fontSize: 12.5, color:"var(--vermillion-deep)",
                lineHeight: 1.7,
              }}>
                <strong style={{fontFamily:"ZCOOL XiaoWei, serif", marginRight: 8}}>批注</strong>
                {c.note}
              </div>
            </div>
          );
        })()}
      </BottomSheet>

      <div style={{position:"absolute", bottom: 0, left: 0, right: 0}}>
        <BottomNav active="clue" onNav={gotoPage}/>
      </div>
    </div>
  );
}

// ============================================================
// 6. TrustRoutePage — 寻找可信之人
// ============================================================
function TrustRoutePage({ state, setState, gotoPage }) {
  const [selected, setSelected] = useState(state.trustedPerson || null);

  const confirm = () => {
    if (!selected) return;
    const ns = { ...state, trustedPerson: selected, currentChapter: 4 };
    setState(ns); saveState(ns);
    gotoPage("story");
  };

  const selChar = TRUST_OPTIONS.find(c => c.id === selected);

  return (
    <div className="page night-deep-bg">
      <div className="topbar" style={{paddingBottom: 4}}>
        <button className="icon-btn press" onClick={() => gotoPage("story")}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M9 1 L3 7 L9 13" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>
        </button>
        <div className="topbar-title">寻 可 托 之 人</div>
        <div style={{width:38}}/>
      </div>

      <div className="page-scroll" style={{top: 56, bottom: 96, padding:"0 14px"}}>
        <div className="fade-in" style={{textAlign:"center", margin: "4px 0 14px"}}>
          <div style={{
            fontSize: 13, lineHeight: 1.8,
            color:"rgba(231,217,179,0.88)",
            letterSpacing:"0.05em",
          }}>
            四更将至。<br/>
            <span style={{color:"var(--gold-pale)"}}>你只能托付一人。</span>
          </div>
        </div>

        <div style={{
          display:"grid", gridTemplateColumns:"1fr 1fr",
          gap: 10, paddingBottom: 14,
        }}>
          {TRUST_OPTIONS.map((c, i) => (
            <div key={c.id} className="fade-up" style={{animationDelay:`${i*70}ms`}}>
              <CharacterCard
                char={c}
                selected={selected === c.id}
                onSelect={() => setSelected(c.id)}
              />
            </div>
          ))}
        </div>

        {/* Detail panel for selection */}
        {selChar && (
          <div className="fade-in" style={{marginTop: 4}}>
            <PaperPanel style={{padding: "14px 16px"}}>
              <div style={{
                display:"flex", alignItems:"center", gap: 10,
                marginBottom: 8,
              }}>
                <SealTag size="sm" style={{transform:"none"}}>{selChar.tag}</SealTag>
                <div className="title-han" style={{
                  fontSize: 16, color:"var(--ink-deep)",
                  letterSpacing:"0.16em",
                }}>{selChar.name}</div>
              </div>
              <div style={{
                fontSize: 13.5, lineHeight: 1.78,
                color:"var(--ink)",
                letterSpacing:"0.04em",
                fontStyle:"italic",
              }}>{selChar.detail}</div>
            </PaperPanel>
          </div>
        )}
      </div>

      <div style={{
        position:"absolute", left:0, right: 0, bottom: 0,
        padding:`12px 18px calc(16px + var(--safe-bottom))`,
        background: "linear-gradient(180deg, transparent, rgba(10,6,4,0.95) 30%)",
      }}>
        <button
          className="btn-primary press"
          onClick={confirm}
          disabled={!selected}
          style={{
            width:"100%",
            opacity: selected ? 1 : 0.4,
            filter: selected ? "none" : "grayscale(0.6)",
            cursor: selected ? "pointer" : "not-allowed",
          }}>
          {selected ? `确 认 托 付 · ${selChar?.name?.split("·")[0].trim() || ""}` : "尚 未 抉 择"}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// 7. ProgressPage — 副本进程
// ============================================================
function ProgressPage({ state, gotoPage }) {
  const cur = state.currentChapter || 1;
  return (
    <div className="page night-deep-bg">
      <div className="topbar" style={{paddingBottom: 4}}>
        <button className="icon-btn press" onClick={() => gotoPage("story")}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M9 1 L3 7 L9 13" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>
        </button>
        <div className="topbar-title">副 本 进 程</div>
        <div style={{width:38}}/>
      </div>

      <div className="page-scroll" style={{top: 56, bottom: 64, padding: "8px 16px 28px"}}>
        <div className="fade-in" style={{textAlign:"center", marginBottom: 14}}>
          <div className="en-small" style={{fontSize: 10, opacity: 0.6, color:"var(--gold-pale)"}}>
            CHAPTER · MAP
          </div>
          <div style={{
            fontSize: 12.5, opacity: 0.75, marginTop: 4,
            color:"rgba(231,217,179,0.85)",
            letterSpacing: "0.05em",
          }}>建安二十五年 · 许都 · 一夜</div>
        </div>

        {/* Vertical timeline */}
        <div style={{position:"relative", paddingLeft: 36}}>
          {/* gold flowing line */}
          <div style={{
            position:"absolute", left: 17, top: 14, bottom: 14,
            width: 2,
            background: "linear-gradient(180deg, transparent, var(--gold-pale) 8%, var(--gold-pale) 92%, transparent)",
            opacity: 0.7,
            boxShadow: "0 0 8px var(--gold-pale)",
          }}/>

          {CHAPTERS.map((c, i) => {
            const isCur = c.num === cur;
            const done = c.num < cur;
            const locked = c.num > cur;
            return (
              <div key={c.id} className="fade-up"
                style={{
                  position:"relative", marginBottom: 14,
                  animationDelay:`${i*80}ms`,
                }}>
                {/* node */}
                <div style={{
                  position:"absolute", left: -26, top: 12,
                  width: 18, height: 18, borderRadius:"50%",
                  background: isCur ? "var(--gold-pale)" : (done ? "var(--gold-deep)" : "rgba(30,22,14,0.9)"),
                  border: "2px solid " + (locked ? "rgba(78,58,20,0.5)" : "var(--gold-pale)"),
                  boxShadow: isCur ? "0 0 14px var(--gold-pale)" : "none",
                }}/>
                {/* card */}
                <div style={{
                  background: isCur
                    ? "linear-gradient(180deg, rgba(60,45,25,0.95), rgba(20,14,8,0.95))"
                    : (done
                      ? "linear-gradient(180deg, rgba(30,22,14,0.85), rgba(15,10,6,0.85))"
                      : "linear-gradient(180deg, rgba(20,14,8,0.5), rgba(10,6,4,0.5))"),
                  border:"1px solid " + (isCur ? "var(--gold-pale)" : (done ? "rgba(201,161,74,0.4)" : "rgba(78,58,20,0.4)")),
                  borderRadius: 2,
                  padding: "12px 14px",
                  opacity: locked ? 0.65 : 1,
                  boxShadow: isCur ? "0 0 24px rgba(231,199,115,0.18)" : "0 4px 12px rgba(0,0,0,0.4)",
                }}>
                  <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
                    <div>
                      <div style={{
                        fontFamily:"ZCOOL XiaoWei, serif", fontSize: 11,
                        opacity: 0.6, letterSpacing:"0.35em",
                        color:"var(--gold-pale)",
                      }}>第 {["一","二","三","四","五"][i]} 章</div>
                      <div className="title-han" style={{
                        fontSize: 17, color: isCur ? "var(--gold-pale)" : "var(--paper)",
                        letterSpacing:"0.2em", textIndent:"0.2em",
                        marginTop: 2,
                      }}>{c.name}</div>
                    </div>
                    {locked && <SealTag size="sm" style={{transform:"rotate(8deg)"}}>封</SealTag>}
                    {isCur && (
                      <div style={{
                        fontSize: 10, color:"var(--gold-pale)",
                        letterSpacing:"0.3em", animation: "glowPulse 2s ease-in-out infinite",
                      }}>· 当前 ·</div>
                    )}
                  </div>
                  <div style={{
                    fontSize: 12.5, marginTop: 8, opacity: 0.78,
                    color:"rgba(231,217,179,0.85)",
                    fontStyle:"italic", lineHeight: 1.6,
                  }}>{c.brief}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{position:"absolute", bottom: 0, left: 0, right: 0}}>
        <BottomNav active="map" onNav={gotoPage}/>
      </div>
    </div>
  );
}

// ============================================================
// 8. EndingPage — 结局展示
// ============================================================
function EndingPage({ state, setState, gotoPage }) {
  const endId = state.lastEnding || resolveEnding(state);
  const e = ENDINGS[endId];

  useEffect(() => {
    // unlock
    if (e && !state.unlockedEndings.includes(endId)) {
      const ns = {
        ...state,
        unlockedEndings: [...state.unlockedEndings, endId],
        lastEnding: endId,
      };
      setState(ns); saveState(ns);
    } else if (state.lastEnding !== endId) {
      const ns = { ...state, lastEnding: endId };
      setState(ns); saveState(ns);
    }
  }, []);

  const sceneFor = (id) => {
    if (id === "ash") return <SceneEndingAsh/>;
    if (id === "sealed") return <SceneEndingSealed/>;
    return <SceneEndingLiving/>;
  };

  const reset = () => {
    const ns = { ...defaultState(), unlockedEndings: state.unlockedEndings };
    setState(ns); saveState(ns);
    gotoPage("cover");
  };
  const replay = () => {
    // restart story from ch1
    const ns = {
      ...state,
      firstChoice: null, ch2: null,
      searchedClues: [],
      trustedPerson: null, finalDecision: null,
      currentChapter: 1, lastEnding: null,
    };
    setState(ns); saveState(ns);
    gotoPage("story");
  };

  if (!e) return null;
  return (
    <div className="page night-deep-bg" style={{overflowY:"auto"}}>
      <div className="page-scroll" style={{padding: 0}}>
        <div style={{position:"relative"}}>
          <div style={{position:"relative", height: 280}}>
            {sceneFor(endId)}
            <div className="grain"/>
            <div className="vignette"/>
            <Particles count={16}/>
            {/* fade */}
            <div style={{
              position:"absolute", left:0, right:0, bottom: 0, height: 80,
              background:"linear-gradient(180deg, transparent, rgba(10,6,4,0.98))",
              pointerEvents:"none",
            }}/>
          </div>

          {/* Title + seal */}
          <div className="ink-in" style={{
            textAlign:"center", padding:"0 24px",
            marginTop: -22, position:"relative", zIndex: 2,
          }}>
            <div style={{
              display:"inline-flex", flexDirection:"column", alignItems:"center", gap: 10,
            }}>
              <div style={{
                animation: "sealStamp 700ms ease-out both",
              }}>
                <SealTag size="lg" style={{
                  background: e.rankColor,
                  borderRadius: 4,
                  width: 84, height: 84, fontSize: 13,
                }}>
                  <div style={{lineHeight: 1.15, letterSpacing:"0.12em", textIndent:"0.12em"}}>
                    <div style={{fontSize: 11, opacity: 0.85}}>结 局</div>
                    <div style={{fontSize: 11, opacity: 0.85, marginTop: 2}}>{e.rank}</div>
                  </div>
                </SealTag>
              </div>
              <div className="title-han" style={{
                fontSize: 26, color:"var(--gold-pale)",
                letterSpacing:"0.3em", textIndent:"0.3em",
                marginTop: 8,
                textShadow: "0 0 20px rgba(231,199,115,0.4)",
              }}>{e.name}</div>
              <div style={{
                fontSize: 12.5, color:"rgba(231,217,179,0.7)",
                fontStyle:"italic", letterSpacing:"0.08em",
                marginTop: -2,
              }}>「{e.epitaph}」</div>
            </div>
          </div>

          {/* Body */}
          <div className="fade-up" style={{
            margin: "24px 18px 18px",
            animationDelay: "300ms",
          }}>
            <PaperPanel style={{padding:"18px 20px 22px"}}>
              <GoldDivider label="余 音"/>
              <div style={{
                fontSize: 14, lineHeight: 2,
                color:"var(--ink-deep)",
                whiteSpace: "pre-line",
                letterSpacing: "0.04em",
                textAlign:"center",
              }}>{e.body}</div>
              <GoldDivider/>
              <div style={{
                textAlign:"center",
                fontFamily:"ZCOOL XiaoWei, serif",
                fontSize: 11, color:"rgba(78,58,20,0.65)",
                letterSpacing:"0.4em", textIndent:"0.4em",
                marginTop: 4,
              }}>· 全 章 终 ·</div>
            </PaperPanel>
          </div>

          {/* Buttons */}
          <div style={{
            display:"flex", flexDirection:"column", gap: 10,
            padding: "0 20px calc(28px + var(--safe-bottom))",
          }}>
            <button className="btn-primary press" onClick={() => gotoPage("gallery")}>
              查 看 结 局 图 鉴
            </button>
            <div style={{display:"grid", gridTemplateColumns: "1fr 1fr", gap: 10}}>
              <button className="btn-ghost press" onClick={replay}>重 新 选 择</button>
              <button className="btn-ghost press" onClick={reset}>青 史 空 间</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 9. GalleryPage — 结局图鉴
// ============================================================
function GalleryPage({ state, gotoPage }) {
  const unlocked = state.unlockedEndings || [];
  return (
    <div className="page night-deep-bg">
      <div className="topbar" style={{paddingBottom: 4}}>
        <button className="icon-btn press" onClick={() => gotoPage("story")}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M9 1 L3 7 L9 13" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>
        </button>
        <div className="topbar-title">结 局 图 鉴</div>
        <div style={{width:38}}/>
      </div>

      <div className="page-scroll" style={{top: 56, bottom: 64, padding: "0 16px"}}>
        <div className="fade-in" style={{textAlign:"center", marginBottom: 14}}>
          <div className="en-small" style={{fontSize: 10, opacity: 0.6, color:"var(--gold-pale)"}}>
            ENDINGS · CODEX
          </div>
          <div style={{
            fontSize: 12.5, opacity: 0.78, marginTop: 6,
            color:"rgba(231,217,179,0.85)", letterSpacing:"0.05em",
          }}>
            已解锁 <span style={{color:"var(--gold-pale)"}}>{unlocked.length}</span> / {Object.keys(ENDINGS).length}
          </div>
        </div>

        {Object.values(ENDINGS).map((e, i) => {
          const has = unlocked.includes(e.id);
          return (
            <div key={e.id} className="fade-up"
              style={{
                marginBottom: 14,
                animationDelay: `${i*90}ms`,
              }}>
              <div style={{
                position:"relative", overflow:"hidden",
                border: "1px solid " + (has ? "rgba(201,161,74,0.6)" : "rgba(78,58,20,0.5)"),
                borderRadius: 2,
                boxShadow: has ? "0 0 0 1px rgba(231,199,115,0.12), 0 8px 24px rgba(0,0,0,0.5)" : "0 4px 12px rgba(0,0,0,0.5)",
              }}>
                <div style={{position:"relative", height: 130}}>
                  {has ? (
                    e.id === "ash" ? <SceneEndingAsh/> :
                    e.id === "sealed" ? <SceneEndingSealed/> :
                    <SceneEndingLiving/>
                  ) : (
                    <div style={{
                      width:"100%", height:"100%",
                      background:"radial-gradient(circle at 50% 50%, rgba(60,45,25,0.6), rgba(8,5,3,0.95))",
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>
                      <div className="title-han" style={{
                        fontSize: 64, color:"rgba(201,161,74,0.18)",
                        letterSpacing:"0.4em",
                      }}>？ ？</div>
                    </div>
                  )}
                  <div className="grain"/>
                  <div className="vignette"/>
                  {has && (
                    <div style={{
                      position:"absolute", top: 10, right: 10,
                      animation: "sealStamp 600ms ease both",
                    }}>
                      <SealTag size="sm" style={{
                        background: e.rankColor,
                        transform:"rotate(-6deg)",
                        width: 38, height: 38, fontSize: 10,
                      }}>{e.rank.slice(0,2)}</SealTag>
                    </div>
                  )}
                </div>
                <div style={{
                  padding: "12px 14px",
                  background:"linear-gradient(180deg, rgba(15,10,6,0.95), rgba(8,5,3,0.95))",
                  borderTop:"1px solid " + (has ? "rgba(201,161,74,0.3)" : "rgba(78,58,20,0.5)"),
                }}>
                  <div className="title-han" style={{
                    fontSize: 16,
                    color: has ? "var(--gold-pale)" : "rgba(140,107,41,0.6)",
                    letterSpacing:"0.2em", textIndent:"0.2em",
                  }}>{has ? e.name : "？ ？ ？"}</div>
                  <div style={{
                    fontSize: 12, marginTop: 6,
                    opacity: has ? 0.8 : 0.45,
                    fontStyle:"italic",
                    color:"rgba(231,217,179,0.85)",
                    letterSpacing:"0.04em",
                  }}>
                    {has ? `「${e.epitaph}」` : "尚未解锁此结局。"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div style={{
          textAlign:"center", padding: "12px 0 20px",
          fontFamily:"ZCOOL XiaoWei, serif",
          fontSize: 11, opacity: 0.45,
          letterSpacing:"0.4em",
        }}>· 收 卷 ·</div>
      </div>

      <div style={{position:"absolute", bottom: 0, left: 0, right: 0}}>
        <BottomNav active="gallery" onNav={gotoPage}/>
      </div>
    </div>
  );
}

Object.assign(window, {
  CoverPage, WorldPage, ChapterSelectPage,
  StoryPage, CluePage, TrustRoutePage, ProgressPage,
  EndingPage, GalleryPage,
});
