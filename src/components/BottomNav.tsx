export type NavKey = "story" | "clue" | "map" | "gallery";

const NAV_ITEMS: { key: NavKey; label: string }[] = [
  { key: "story", label: "剧情" },
  { key: "clue", label: "线索" },
  { key: "map", label: "进程" },
  { key: "gallery", label: "图鉴" },
];

interface BottomNavProps {
  active: NavKey;
  onNav: (key: NavKey) => void;
}

export function BottomNav({ active, onNav }: BottomNavProps) {
  return (
    <div className="bottomnav">
      {NAV_ITEMS.map(it => (
        <button key={it.key}
          className={"navitem press " + (active === it.key ? "active" : "")}
          onClick={() => onNav(it.key)}>
          <span className="navdot"></span>
          <span>{it.label}</span>
        </button>
      ))}
    </div>
  );
}
