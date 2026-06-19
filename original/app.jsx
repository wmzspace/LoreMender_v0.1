/* ============================================================
   app.jsx — main App + simple router
   ============================================================ */
const { useState: useState_, useEffect: useEffect_ } = React;

function App() {
  const [state, setState] = useState_(() => loadState());
  // page = cover | world | dungeon | story | clue | trust | map | ending | gallery
  const [page, setPage] = useState_("cover");
  const [transKey, setTransKey] = useState_(0);

  const gotoPage = (p) => {
    setPage(p);
    setTransKey(k => k + 1);
    // scroll top
    setTimeout(() => {
      const sc = document.querySelector(".page-scroll");
      if (sc) sc.scrollTop = 0;
    }, 30);
  };

  const gotoEnding = () => {
    const endId = resolveEnding(state);
    const ns = { ...state, lastEnding: endId };
    setState(ns); saveState(ns);
    gotoPage("ending");
  };

  let pageEl = null;
  switch (page) {
    case "cover":
      pageEl = <CoverPage
        onStart={() => gotoPage("dungeon")}
        onWorld={() => gotoPage("world")}
      />;
      break;
    case "world":
      pageEl = <WorldPage
        onBack={() => gotoPage("cover")}
        onEnter={() => gotoPage("dungeon")}
      />;
      break;
    case "dungeon":
      pageEl = <ChapterSelectPage
        onBack={() => gotoPage("cover")}
        onEnter={() => {
          // start story from chapter 1 if not already in run
          if (!state.currentChapter) {
            const ns = { ...state, currentChapter: 1 };
            setState(ns); saveState(ns);
          }
          gotoPage("story");
        }}
      />;
      break;
    case "story":
      pageEl = <StoryPage state={state} setState={setState}
        gotoPage={gotoPage} gotoEnding={gotoEnding}/>;
      break;
    case "clue":
      pageEl = <CluePage state={state} setState={setState} gotoPage={gotoPage}/>;
      break;
    case "trust":
      pageEl = <TrustRoutePage state={state} setState={setState} gotoPage={gotoPage}/>;
      break;
    case "map":
      pageEl = <ProgressPage state={state} gotoPage={gotoPage}/>;
      break;
    case "ending":
      pageEl = <EndingPage state={state} setState={setState} gotoPage={gotoPage}/>;
      break;
    case "gallery":
      pageEl = <GalleryPage state={state} gotoPage={gotoPage}/>;
      break;
    default:
      pageEl = <div className="page night-bg" style={{display:"flex",alignItems:"center",justifyContent:"center"}}>
        <div style={{color:"var(--paper)"}}>页面未找到</div>
      </div>;
  }

  return (
    <div className="stage">
      <div className="phone">
        <div className="phone-notch"/>
        <div className="screen">
          <div key={transKey} style={{position:"absolute", inset: 0, animation: "fadeIn 380ms ease both"}}>
            {pageEl}
          </div>
        </div>
      </div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);
