"use client";
import { useEffect, useRef, useState } from "react";
import type { PublicCase } from "@/lib/generator";

type Result = { correct: boolean; score: number; over: boolean; culpritId?: string;
  breakdown?: { suspectId: string; verdict: string; note: string }[] };
const rating = (s: number) => s >= 800 ? "Sherlock" : s >= 600 ? "Inspector" : s >= 350 ? "Detective" : "Rookie";

function Game({ level, onExit, onNext, onDone }: { level: number; onExit: () => void; onNext: () => void; onDone: (s: number) => void }) {
  const [c, setC] = useState<PublicCase | null>(null);
  const [hints, setHints] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const start = useRef(Date.now());

  useEffect(() => { fetch(`/api/case?level=${level}`).then(r => r.json()).then(d => { setC(d); start.current = Date.now(); }); }, [level]);

  async function accuse(suspectId: string) {
    const res = await fetch("/api/accuse", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, suspectId, hintsUsed: hints, wrongGuesses: wrong.length, secondsTaken: Math.round((Date.now() - start.current) / 1000) }) });
    const r: Result = await res.json();
    if (r.over) { setResult(r); if (r.correct) onDone(r.score); }
    else { setWrong([...wrong, suspectId]); setMsg(`Not them. ${2 - wrong.length} guess${wrong.length === 1 ? "" : "es"} left.`); }
  }

  if (!c) return <main><p>Opening the case file…</p></main>;
  const share = result?.correct ? `Alibi level ${level} | ${rating(result.score)} ${result.score} pts | ${hints} hints | ${wrong.length} wrong` : `Alibi level ${level} | The culprit got away`;
  return (
    <main>
      <button className="ghost" onClick={onExit}>← All levels</button>
      <h1>{c.title}</h1>
      <div className="bar"><span>{c.difficulty}</span><span>Hint −100</span><span>Wrong −150</span><span>Time −2/sec</span></div>
      <p>{c.intro}</p>
      <h2>Evidence</h2>
      {c.evidence.map(e => <div className="slip" key={e.id}><b>{e.time}</b>{e.text}</div>)}
      <h2>Suspects</h2>
      {c.suspects.map(s => {
        const out = wrong.includes(s.id), culprit = result?.culpritId === s.id, note = result?.breakdown?.find(b => b.suspectId === s.id);
        return (
          <div key={s.id} className={`suspect ${out && !result ? "out" : ""} ${culprit ? "culprit" : ""}`}>
            <div className="name">{s.name}</div><div className="role">{s.role}</div>
            <blockquote>“{s.statement}”</blockquote>
            {!result && <button disabled={out} onClick={() => accuse(s.id)}>{out ? "Ruled out" : `Accuse ${s.name.split(" ")[0]}`}</button>}
            {note && <div className="note"><b>{note.verdict}.</b> {note.note}</div>}
          </div>
        );
      })}
      {!result && (<>
        {c.hints.slice(0, hints).map((h, i) => <p className="hint" key={i}>Hint {i + 1}: {h}</p>)}
        {msg && <p className="msg">{msg}</p>}
        <button className="ghost" disabled={hints >= c.hints.length} onClick={() => setHints(hints + 1)}>Get a hint</button>
      </>)}
      {result && (
        <div className="verdict">
          <h3>{result.correct ? "Case closed" : "The culprit walked"}</h3>
          {result.correct && <><div className="score">{result.score}</div><div>Rating: {rating(result.score)}</div></>}
          <p className="type">{share}</p>
          <button onClick={() => { navigator.clipboard.writeText(share); setCopied(true); }}>{copied ? "Copied" : "Copy result"}</button>{" "}
          {result.correct && level < 100 && <button onClick={onNext}>Next level →</button>}{" "}
          {!result.correct && <button onClick={() => { setResult(null); setWrong([]); setHints(0); setMsg(""); start.current = Date.now(); }}>Retry level</button>}
        </div>
      )}
    </main>
  );
}

export default function Home() {
  const [prog, setProg] = useState<Record<number, number>>({});
  const [level, setLevel] = useState<number | null>(null);
  const [all, setAll] = useState(false);
  useEffect(() => { try { setProg(JSON.parse(localStorage.getItem("alibi:v1") || "{}")); } catch {} }, []);
  const done = (l: number, s: number) => { const next = { ...prog, [l]: Math.max(prog[l] ?? 0, s) }; setProg(next); try { localStorage.setItem("alibi:v1", JSON.stringify(next)); } catch {} };

  if (level !== null) return <Game key={level} level={level} onExit={() => setLevel(null)} onNext={() => setLevel(level + 1)} onDone={s => done(level, s)} />;
  const solved = Object.keys(prog).length, total = Object.values(prog).reduce((a, b) => a + b, 0);
  return (
    <main>
      <h1>Alibi</h1>
      <p>One suspect is lying, and a record proves it. Read the evidence, compare it with the statements, and name the culprit.</p>
      <div className="bar"><span>Solved {solved}/100</span><span>Total {total} pts</span><span>1–33 Straightforward</span><span>34–66 Tricky</span><span>67–100 Brutal</span></div>
      <h2>Levels</h2>
      <div className="grid">
        {Array.from({ length: 100 }, (_, i) => i + 1).map(l => {
          const open = all || l === 1 || (l - 1) in prog;
          return <button key={l} className={`lvl ${l in prog ? "won" : ""}`} disabled={!open} onClick={() => setLevel(l)}>{l}<small>{l in prog ? prog[l] : open ? "open" : "locked"}</small></button>;
        })}
      </div>
      <p className="role"><label><input type="checkbox" checked={all} onChange={e => setAll(e.target.checked)} /> Unlock all levels (for testing)</label></p>
    </main>
  );
}
