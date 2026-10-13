"use client";
import { useEffect, useRef, useState } from "react";
import type { PublicCase } from "@/lib/case";

type Result = { correct: boolean; score: number; over: boolean; culpritId?: string;
  breakdown?: { suspectId: string; verdict: string; note: string }[] };

const rating = (s: number) => s >= 800 ? "Sherlock" : s >= 600 ? "Inspector" : s >= 350 ? "Detective" : "Rookie";

export default function Home() {
  const [c, setC] = useState<PublicCase | null>(null);
  const [hints, setHints] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [result, setResult] = useState<Result | null>(null);
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const start = useRef(Date.now());

  useEffect(() => { fetch("/api/case").then(r => r.json()).then(setC); start.current = Date.now(); }, []);

  async function accuse(suspectId: string) {
    const res = await fetch("/api/accuse", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suspectId, hintsUsed: hints, wrongGuesses: wrong.length,
        secondsTaken: Math.round((Date.now() - start.current) / 1000) }),
    });
    const r: Result = await res.json();
    if (r.over) setResult(r);
    else { setWrong([...wrong, suspectId]); setMsg(`Not them. The record doesn't hold against that person. ${2 - wrong.length} guess${wrong.length === 1 ? "" : "es"} left.`); }
  }

  if (!c) return <main><p>Opening the case file…</p></main>;
  const share = result?.correct
    ? `Alibi #${c.id} | ${rating(result.score)} ${result.score} pts | ${hints} hints | ${wrong.length} wrong`
    : `Alibi #${c.id} | The culprit got away`;

  return (
    <main>
      <h1>{c.title}</h1>
      <p>{c.intro}</p>
      <div className="bar"><span>Hint costs 100 pts</span><span>Wrong accusation costs 150 pts</span><span>Time costs 2 pts a second</span></div>

      <h2>Evidence</h2>
      {c.evidence.map(e => <div className="slip" key={e.id}><b>{e.time}</b>{e.text}</div>)}

      <h2>Suspects</h2>
      {c.suspects.map(s => {
        const out = wrong.includes(s.id);
        const culprit = result?.culpritId === s.id;
        const note = result?.breakdown?.find(b => b.suspectId === s.id);
        return (
          <div key={s.id} className={`suspect ${out && !result ? "out" : ""} ${culprit ? "culprit" : ""}`}>
            <div className="name">{s.name}</div><div className="role">{s.role}</div>
            <blockquote>“{s.statement}”</blockquote>
            {!result && <button disabled={out} onClick={() => accuse(s.id)}>{out ? "Ruled out" : `Accuse ${s.name.split(" ").slice(-1)[0]}`}</button>}
            {note && <div className="note"><b>{note.verdict}.</b> {note.note}</div>}
          </div>
        );
      })}

      {!result && (
        <>
          {c.hints.slice(0, hints).map((h, i) => <p className="hint" key={i}>Hint {i + 1}: {h}</p>)}
          {msg && <p className="msg">{msg}</p>}
          <button className="ghost" disabled={hints >= c.hints.length} onClick={() => setHints(hints + 1)}>Get a hint</button>
        </>
      )}

      {result && (
        <div className="verdict">
          <h3>{result.correct ? "Case closed" : "The culprit walked"}</h3>
          {result.correct && <><div className="score">{result.score}</div><div>Rating: {rating(result.score)}</div></>}
          <p className="type">{share}</p>
          <button onClick={() => { navigator.clipboard.writeText(share); setCopied(true); }}>{copied ? "Copied" : "Copy result"}</button>
        </div>
      )}
    </main>
  );
}
