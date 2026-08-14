"use client";

import { useEffect, useMemo, useState } from "react";
import { BoostArt, PlanterArt, PlantArt, ToolArt } from "./garden-art";

type Task = {
  id: string;
  label: string;
  completed: boolean;
  note?: string;
};

const initialCare: Task[] = [
  { id: "wash", label: "Wash face", completed: true },
  { id: "teeth", label: "Brush teeth", completed: false },
  { id: "meds", label: "Take medication", completed: false, note: "Evening" },
];

const initialToday: Task[] = [
  { id: "doctor", label: "Call the doctor", completed: false, note: "Before 17:00" },
  { id: "school", label: "Spend ten minutes on the assignment", completed: false },
];

const growthItems = [
  { id: "move", title: "Move my body more", invitation: "Take a five-minute walk", tended: "Tended twice recently", icon: "✦" },
  { id: "read", title: "Read more often", invitation: "Read one page", tended: "Tended last week", icon: "☾" },
];

type GardenInventory = { dandelion: number; water: number; clover: number };
type MarketCategory = "planters" | "seeds" | "tools" | "boosts";
type MarketItem = { id: string; name: string; price: number; tier: "everyday" | "special" | "moonlit"; category: MarketCategory; art: string; description: string };

const marketItems: MarketItem[] = [
  { id: "nursery", name: "Nursery pot", price: 0, tier: "everyday", category: "planters", art: "nursery", description: "Your sturdy starter pot. Holds one plant." },
  { id: "clay", name: "Clay pot", price: 3, tier: "special", category: "planters", art: "clay", description: "Holds one plant · 15% growth boost." },
  { id: "ceramic", name: "Ceramic planter", price: 5, tier: "special", category: "planters", art: "ceramic", description: "Holds two plants and two species." },
  { id: "trough", name: "Garden trough", price: 7, tier: "moonlit", category: "planters", art: "trough", description: "Holds five plants from up to two species." },
  { id: "moon", name: "Moon basin", price: 10, tier: "moonlit", category: "planters", art: "moon", description: "Three plants · rare growth enhancement." },
  { id: "dandelion", name: "Dandelion seeds", price: 0, tier: "everyday", category: "seeds", art: "dandelion", description: "Common, bright, and determined." },
  { id: "clover", name: "Clover seeds", price: 1, tier: "everyday", category: "seeds", art: "clover", description: "A soft green ground cover." },
  { id: "lavender", name: "Lavender seeds", price: 2, tier: "special", category: "seeds", art: "lavender", description: "Calm colour with a gentle sway." },
  { id: "marigold", name: "Marigold seeds", price: 2, tier: "special", category: "seeds", art: "marigold", description: "A warm little burst of colour." },
  { id: "orchid", name: "Moon orchid", price: 8, tier: "moonlit", category: "seeds", art: "orchid", description: "A rare flower with a gentle night glow." },
  { id: "watering-can", name: "Watering can", price: 2, tier: "everyday", category: "tools", art: "watering-can", description: "Makes daily watering easier." },
  { id: "trowel", name: "Copper trowel", price: 2, tier: "special", category: "tools", art: "trowel", description: "Opens an additional planting place." },
  { id: "shears", name: "Pruning shears", price: 4, tier: "special", category: "tools", art: "shears", description: "Encourages mature plants to flower again." },
  { id: "water", name: "Fresh water", price: 0, tier: "everyday", category: "boosts", art: "water", description: "A small drink for something growing." },
  { id: "compost", name: "Rich compost", price: 1.5, tier: "everyday", category: "boosts", art: "compost", description: "Adds one gentle growth step." },
  { id: "moon-dew", name: "Moon Dew", price: 4, tier: "moonlit", category: "boosts", art: "moon-dew", description: "A rare boost for night-blooming plants." },
];

const formatMoonlight = (value: number) => Number.isInteger(value) ? `${value}` : `${Math.floor(value)}½`;

function MarketArt({ item }: { item: MarketItem }) {
  if (item.category === "planters") return <PlanterArt kind={item.art as "nursery" | "clay" | "ceramic" | "trough" | "moon"} />;
  if (item.category === "seeds") return <PlantArt species={item.art as "dandelion" | "lavender" | "clover" | "marigold" | "fern" | "orchid"} stage={4} size="small" />;
  if (item.category === "tools") return <ToolArt kind={item.art as "watering-can" | "trowel" | "shears" | "gloves"} />;
  return <BoostArt kind={item.art as "water" | "compost" | "moon-dew" | "root-tonic"} />;
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return (
    <button
      className={`task-row ${task.completed ? "is-complete" : ""}`}
      onClick={onToggle}
      aria-pressed={task.completed}
    >
      <span className="task-moon" aria-hidden="true"><i /></span>
      <span className="task-copy">
        <span className="task-label">{task.label}</span>
        {task.note && <span className="task-note">{task.note}</span>}
      </span>
      {task.completed && <span className="care-mark">care given</span>}
    </button>
  );
}

function GardenView({
  growing, onGrowthSeen, moonlight, setMoonlight, inventory, setInventory,
  giftClaimed, setGiftClaimed, plantedDandelion, setPlantedDandelion,
}: {
  growing: boolean;
  onGrowthSeen: () => void;
  moonlight: number;
  setMoonlight: React.Dispatch<React.SetStateAction<number>>;
  inventory: GardenInventory;
  setInventory: React.Dispatch<React.SetStateAction<GardenInventory>>;
  giftClaimed: boolean;
  setGiftClaimed: React.Dispatch<React.SetStateAction<boolean>>;
  plantedDandelion: boolean;
  setPlantedDandelion: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [revealed, setRevealed] = useState(!growing);
  const [growthActive, setGrowthActive] = useState(growing);
  const [marketOpen, setMarketOpen] = useState(false);
  const [hideUnaffordable, setHideUnaffordable] = useState(false);
  const [hideMoonlit, setHideMoonlit] = useState(false);
  const [selectedItem, setSelectedItem] = useState<keyof GardenInventory | null>(null);
  const [giftVisible, setGiftVisible] = useState(true);
  const [rhythmVisible, setRhythmVisible] = useState(true);
  const [rhythmCollapsed, setRhythmCollapsed] = useState(false);
  const [marketCategory, setMarketCategory] = useState<MarketCategory>("planters");
  const rhythmDays = 3;
  const missedDays = 1;
  const rhythmPayout = Math.max(.5, Math.min(5, rhythmDays * .5 - Math.floor(missedDays / 2) * .5));

  useEffect(() => {
    if (!growing) return;
    setGrowthActive(true);
    setRevealed(false);
    const timer = window.setTimeout(() => {
      setRevealed(true);
    }, 900);
    const seenTimer = window.setTimeout(onGrowthSeen, 1800);
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(seenTimer);
    };
  }, [growing, onGrowthSeen]);

  useEffect(() => {
    if (!giftClaimed) return;
    const timer = window.setTimeout(() => setGiftVisible(false), 10000);
    return () => window.clearTimeout(timer);
  }, [giftClaimed]);

  const visibleMarketItems = marketItems.filter((item) =>
    item.category === marketCategory && (!hideUnaffordable || item.price <= moonlight) && (!hideMoonlit || item.tier !== "moonlit")
  );

  function claimGift() {
    if (giftClaimed) return;
    setInventory((current) => ({ ...current, dandelion: current.dandelion + 1, water: current.water + 1 }));
    setGiftClaimed(true);
  }

  function buy(item: MarketItem) {
    if (item.price === 0) {
      claimGift();
      return;
    }
    if (item.price > moonlight || !["dandelion", "clover"].includes(item.id)) return;
    setMoonlight((value) => value - item.price);
    setInventory((current) => ({ ...current, [item.id]: current[item.id as keyof GardenInventory] + 1 }));
  }

  function plantDandelion() {
    if (selectedItem !== "dandelion" || inventory.dandelion < 1 || plantedDandelion) return;
    setInventory((current) => ({ ...current, dandelion: current.dandelion - 1 }));
    setPlantedDandelion(true);
    setSelectedItem(null);
  }

  return (
    <section className="garden-view">
      <header className="garden-header">
        <div>
          <p className="eyebrow">Your quiet place</p>
          <h1>The Garden</h1>
          <p>Every small act of care leaves something behind.</p>
        </div>
        <button className="garden-balance" onClick={() => setMarketOpen(true)}><span>✦</span>{formatMoonlight(moonlight)}</button>
      </header>

      {rhythmVisible && <section className={`rhythm-card ${rhythmCollapsed ? "collapsed" : ""}`}>
        <div className="rhythm-visual" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        <div className="rhythm-copy">
          <span>Garden Rhythm</span>
          <strong>{rhythmDays} days tended</strong>
          <p>Today’s gentle bonus: {formatMoonlight(rhythmPayout)} Moonlight</p>
        </div>
        <div className="rhythm-actions">
          <button onClick={() => setRhythmCollapsed((value) => !value)} aria-label={rhythmCollapsed ? "Expand Garden Rhythm" : "Collapse Garden Rhythm"}>{rhythmCollapsed ? "+" : "−"}</button>
          <button onClick={() => setRhythmVisible(false)} aria-label="Dismiss Garden Rhythm">×</button>
        </div>
        <p className="rhythm-rest">One rest day. Your rhythm stays exactly where it is.</p>
      </section>}

      {giftVisible && <button className={`daily-gift ${giftClaimed ? "claimed" : ""}`} onClick={claimGift} disabled={giftClaimed}>
        <span className="gift-icon">{giftClaimed ? "✓" : "✺"}</span>
        <span><strong>{giftClaimed ? "Today’s gift is in your pockets" : "A small gift for today"}</strong><small>{giftClaimed ? "One dandelion seed and one water" : "Dandelion seed + water · always free"}</small></span>
        <b>{giftClaimed ? "Collected" : "Collect"}</b>
      </button>}

      <div className={`garden-scene ${growthActive ? "is-growing" : ""}`}>
        <div className="stars"><i /><i /><i /><i /><i /></div>
        <div className="hill hill-back" />
        <div className="hill hill-front" />
        <div className="garden-path"><i /><i /><i /><i /><i /></div>

        <div className="hanging-garden hanging-left">
          <span className="hanger-line line-a" /><span className="hanger-line line-b" />
          <span className="garden-shelf" />
          <div className="hanging-pot pot-a"><PlantArt species="marigold" size="small" /><PlanterArt kind="clay" size="small" /></div>
          <div className="hanging-pot pot-b"><PlantArt species="fern" size="small" /><PlanterArt kind="ceramic" size="small" /></div>
          <span className="vine vine-a"><i /><i /><i /><i /></span>
        </div>

        <div className="hanging-garden hanging-right">
          <span className="hanger-line line-a" /><span className="hanger-line line-b" />
          <span className="garden-shelf" />
          <div className="hanging-pot pot-a fruit-pot"><PlantArt species="clover" size="small" /><PlanterArt kind="clay" size="small" /><b /><b /><b /></div>
          <div className="hanging-pot pot-b"><PlantArt species="orchid" size="small" /><PlanterArt kind="moon" size="small" /></div>
          <span className="vine vine-b"><i /><i /><i /><i /><i /></span>
        </div>

        <button className={`garden-bed bed-left ${selectedItem === "dandelion" ? "ready" : ""}`} onClick={plantDandelion} aria-label="Lavender and dandelion trough">
          <span className="bed-plants">
            <PlantArt species="lavender" stage={growthActive ? 4 : 3} size="small" />
            <PlantArt species={plantedDandelion ? "dandelion" : "lavender"} stage={plantedDandelion ? 3 : 2} size="small" />
            <PlantArt species="lavender" stage={4} size="small" />
          </span>
          <PlanterArt kind="trough" size="large" />
          <span className="bed-label"><strong>Evening lavender</strong><small>{plantedDandelion ? "Lavender · Dandelion" : "Lavender · new growth"}</small></span>
        </button>

        <button className="garden-bed bed-right" aria-label="Kitchen greens trough">
          <span className="bed-plants">
            <PlantArt species="clover" size="small" />
            <PlantArt species="marigold" stage={3} size="small" />
            <PlantArt species="clover" stage={3} size="small" />
          </span>
          <PlanterArt kind="trough" size="large" />
          <span className="bed-label"><strong>Kitchen greens</strong><small>Clover · Marigold</small></span>
        </button>

        <div className="edge-foliage foliage-left"><PlantArt species="fern" size="large" /><i /><i /></div>
        <div className="edge-foliage foliage-right"><PlantArt species="fern" size="large" /><i /><i /></div>
      </div>

      <div className={`growth-message ${growthActive ? "show" : ""}`} role="status">
        <span className="growth-spark">✦</span>
        <div>
          <strong>{revealed ? "Your lavender grew." : "Something is stirring…"}</strong>
          <p>{revealed ? "The care you gave yourself reached your garden." : "A little Moonlight found its way here."}</p>
        </div>
      </div>

      <section className="garden-tray">
        <div className="tray-heading">
          <div><h2>Garden pockets</h2><p>Ready whenever you are.</p></div>
          <button onClick={() => setMarketOpen(true)}>Market</button>
        </div>
        <div className="tray-items">
          <button className={selectedItem === "dandelion" ? "selected" : ""} onClick={() => inventory.dandelion > 0 && setSelectedItem("dandelion")}><span>✺</span><strong>Dandelion</strong><small>{inventory.dandelion} seed{inventory.dandelion === 1 ? "" : "s"}</small></button>
          <button className={selectedItem === "water" ? "selected" : ""} onClick={() => inventory.water > 0 && setSelectedItem("water")}><span className="water-drop">◆</span><strong>Water</strong><small>{inventory.water} use{inventory.water === 1 ? "" : "s"}</small></button>
          <button className={selectedItem === "clover" ? "selected" : ""} onClick={() => inventory.clover > 0 && setSelectedItem("clover")}><span>♣</span><strong>Clover</strong><small>{inventory.clover} seed{inventory.clover === 1 ? "" : "s"}</small></button>
        </div>
      </section>

      {marketOpen && <div className="market-backdrop" onClick={() => setMarketOpen(false)}>
        <section className="market-sheet" onClick={(event) => event.stopPropagation()} aria-label="Garden market">
          <div className="sheet-handle" />
          <header><div><p className="eyebrow">Spend only if it feels good</p><h2>Garden Market</h2></div><button onClick={() => setMarketOpen(false)} aria-label="Close market">×</button></header>
          <div className="market-balance"><span>Available Moonlight</span><strong>✦ {formatMoonlight(moonlight)}</strong></div>
          <div className="market-settings">
            <label><input type="checkbox" checked={hideUnaffordable} onChange={(e) => setHideUnaffordable(e.target.checked)} /> Hide what I can’t afford</label>
            <label><input type="checkbox" checked={hideMoonlit} onChange={(e) => setHideMoonlit(e.target.checked)} /> Hide Moonlit Collection</label>
          </div>
          <div className="market-tabs" role="tablist" aria-label="Market sections">
            {(["planters", "seeds", "tools", "boosts"] as MarketCategory[]).map((category) => <button key={category} role="tab" aria-selected={marketCategory === category} className={marketCategory === category ? "active" : ""} onClick={() => setMarketCategory(category)}>{category}</button>)}
          </div>
          <div className="market-grid">
            {visibleMarketItems.map((item) => <article key={item.id} className={item.price > moonlight ? "unaffordable" : ""}>
              <span className="market-art-wrap"><MarketArt item={item} /></span><small>{item.tier}</small><h3>{item.name}</h3><p>{item.description}</p>
              <button onClick={() => buy(item)} disabled={item.price > moonlight || !["dandelion", "clover"].includes(item.id) || (item.price === 0 && giftClaimed)}>
                {!["dandelion", "clover"].includes(item.id) ? (item.price > moonlight ? `✦ ${formatMoonlight(item.price)}` : "Preview item") : item.price === 0 ? (giftClaimed ? "Collected today" : "Collect daily gift") : `✦ ${formatMoonlight(item.price)}`}
              </button>
            </article>)}
          </div>
        </section>
      </div>}
    </section>
  );
}

export default function Home() {
  const [care, setCare] = useState(initialCare);
  const [today, setToday] = useState(initialToday);
  const [moonlight, setMoonlight] = useState(3.5);
  const [message, setMessage] = useState("You made room for yourself yesterday.");
  const [tended, setTended] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<"today" | "garden">("today");
  const [gardenReady, setGardenReady] = useState(false);
  const [inventory, setInventory] = useState<GardenInventory>({ dandelion: 0, water: 0, clover: 0 });
  const [giftClaimed, setGiftClaimed] = useState(false);
  const [plantedDandelion, setPlantedDandelion] = useState(false);

  const completed = useMemo(
    () => [...care, ...today].filter((task) => task.completed).length,
    [care, today]
  );

  function toggleTask(group: "care" | "today", id: string) {
    const setter = group === "care" ? setCare : setToday;
    setter((items) =>
      items.map((task) => {
        if (task.id !== id) return task;
        const next = !task.completed;
        const reward = group === "care" ? .5 : 1;
        setMoonlight((value) => Math.max(0, value + (next ? reward : -reward)));
        setMessage(next ? "You cared for yourself. Your lavender is ready to grow." : "No problem. You can return to it whenever you like.");
        if (next) setGardenReady(true);
        return { ...task, completed: next };
      })
    );
  }

  function tend(id: string) {
    setTended((items) => items.includes(id) ? items : [...items, id]);
    setMoonlight((value) => value + .5);
    setMessage("A small beginning is still a beginning.");
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <div className="brand-mark" aria-label="Moon Garden">
          <span className="crescent">☾</span>
          <span>moon garden</span>
        </div>
        <button className="moonlight" aria-label={`${moonlight} Moonlight`}>
          <span aria-hidden="true">✦</span> {formatMoonlight(moonlight)}
        </button>
      </header>

      {activeView === "today" ? <>
      <section className="welcome" aria-labelledby="welcome-title">
          <p className="eyebrow">Good evening, Shelby</p>
          <h1 id="welcome-title">You are already growing.</h1>
        <div className="garden-note">
          <span className="garden-orb" aria-hidden="true"><i /></span>
          <div>
            <p>{message}</p>
            <span>Your lavender has started to grow.</span>
          </div>
          <button aria-label="Visit your garden">›</button>
        </div>
      </section>

      <section className="day-intro">
        <div>
          <p className="eyebrow">Friday, 14 August</p>
          <h2>What would help today?</h2>
          <p>Choose whatever feels manageable.</p>
        </div>
        <div className="day-moon" aria-label={`${completed} acts of care today`}>
          <span>{completed}</span>
          <small>today</small>
        </div>
      </section>

      <section className="task-section" aria-labelledby="daily-care-title">
        <div className="section-heading">
          <div>
            <h2 id="daily-care-title">Daily Care</h2>
            <p className="section-subtitle">Little things to keep you going.</p>
          </div>
          <button className="quiet-action">Edit</button>
        </div>
        <div className="task-list">
          {care.map((task) => <TaskRow key={task.id} task={task} onToggle={() => toggleTask("care", task.id)} />)}
        </div>
      </section>

      <section className="task-section" aria-labelledby="today-title">
        <div className="section-heading">
          <div>
            <h2 id="today-title">Today</h2>
            <p className="section-subtitle">Important things you can get through.</p>
          </div>
          <button className="add-button" aria-label="Add something for today">＋</button>
        </div>
        <div className="task-list">
          {today.map((task) => <TaskRow key={task.id} task={task} onToggle={() => toggleTask("today", task.id)} />)}
        </div>
        <button className="not-today">Need less today? <span>Make some room</span></button>
      </section>

      <section className="growing-section" aria-labelledby="growing-title">
        <div className="section-heading growing-heading">
          <div>
            <h2 id="growing-title">The Garden</h2>
            <p className="section-subtitle">Things I’m growing at my own pace.</p>
          </div>
          <button className="quiet-action">See all</button>
        </div>
        <div className="growth-scroll">
          {growthItems.map((item, index) => {
            const isTended = tended.includes(item.id);
            return (
              <article className={`growth-card growth-${index + 1} ${isTended ? "is-tended" : ""}`} key={item.id}>
                <span className="growth-icon" aria-hidden="true">{isTended ? "✓" : item.icon}</span>
                <p>{item.tended}</p>
                <h3>{item.title}</h3>
                <span className="invitation">{isTended ? "You tended this today" : item.invitation}</span>
                <button onClick={() => tend(item.id)} disabled={isTended}>
                  {isTended ? "Tended" : "Tend this"}
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <p className="permission">Nothing here is a test. Small things still count.</p>

      </> : <GardenView growing={gardenReady} onGrowthSeen={() => setGardenReady(false)} moonlight={moonlight} setMoonlight={setMoonlight} inventory={inventory} setInventory={setInventory} giftClaimed={giftClaimed} setGiftClaimed={setGiftClaimed} plantedDandelion={plantedDandelion} setPlantedDandelion={setPlantedDandelion} />}

      <nav className="bottom-nav" aria-label="Main navigation">
        <button className={activeView === "today" ? "active" : ""} onClick={() => setActiveView("today")}><span>⌂</span>Today</button>
        <button className={activeView === "garden" ? "active" : ""} onClick={() => setActiveView("garden")}><span>✿</span>Garden{gardenReady && <i className="nav-dot" />}</button>
        <button><span>◇</span>Discover</button>
        <button><span>○</span>You</button>
      </nav>
    </main>
  );
}
