"use client";

import { useMemo, useState } from "react";

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

function TaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return (
    <button
      className={`task-row ${task.completed ? "is-complete" : ""}`}
      onClick={onToggle}
      aria-pressed={task.completed}
    >
      <span className="check" aria-hidden="true">{task.completed ? "✓" : ""}</span>
      <span className="task-copy">
        <span className="task-label">{task.label}</span>
        {task.note && <span className="task-note">{task.note}</span>}
      </span>
      {task.completed && <span className="care-mark">care given</span>}
    </button>
  );
}

export default function Home() {
  const [care, setCare] = useState(initialCare);
  const [today, setToday] = useState(initialToday);
  const [moonlight, setMoonlight] = useState(38);
  const [message, setMessage] = useState("You made room for yourself yesterday.");
  const [tended, setTended] = useState<string[]>([]);

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
        setMoonlight((value) => Math.max(0, value + (next ? 4 : -4)));
        setMessage(next ? "That counts. Your garden felt it, too." : "No problem. You can return to it whenever you like.");
        return { ...task, completed: next };
      })
    );
  }

  function tend(id: string) {
    setTended((items) => items.includes(id) ? items : [...items, id]);
    setMoonlight((value) => value + 3);
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
          <span aria-hidden="true">✦</span> {moonlight}
        </button>
      </header>

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

      <nav className="bottom-nav" aria-label="Main navigation">
        <button className="active"><span>⌂</span>Today</button>
        <button><span>✿</span>Garden<i className="nav-dot" /></button>
        <button><span>◇</span>Discover</button>
        <button><span>○</span>You</button>
      </nav>
    </main>
  );
}
