// Deterministic case generator: level N always produces the same case.
// Every case is verified in code: exactly ONE suspect's statement is contradicted by a record.
export type Suspect = { id: string; name: string; role: string; statement: string };
export type PublicCase = { level: number; title: string; difficulty: string; intro: string;
  evidence: { id: string; time: string; text: string }[]; suspects: Suspect[]; hints: string[] };
export type Solution = { culpritId: string; breakdown: { suspectId: string; verdict: string; note: string }[] };
type Seg = { place: string; from: number; to: number };
type Rec = { who: number; place: string; at: number };

const FIRST = ["Ana","Marcus","Priya","Tom","Iris","Leo","Mira","Owen","Sana","Felix","Nora","Raj","Elena","Jonas","Kavya","Dmitri"];
const LAST = ["Nair","Hale","Voss","Reyes","Calloway","Okafor","Lindqvist","Moreau","Banerjee","Castell","Ibarra","Kessler","Whitfield","Dsouza","Arden","Petrov"];
const ROLES = ["Business partner","Personal assistant","Neighbour","Cousin","Accountant","Security guard","Head chef","Old friend"];
const MOTIVES = ["owed him a large sum","was passed over for the promotion he blocked","was cut from his will","had a furious argument with him last week","was fired by him on Tuesday","knew a secret he threatened to expose","resented how he treated my family"];
const THEMES = [
  { name: "Halloran Manor", scene: "the study", victim: "Edmund Halloran, a retired shipping magnate", places: ["the kitchen","the garden","the garage","the library","the cellar","the balcony"] },
  { name: "Meridian Tower", scene: "the CEO's office", victim: "Dana Whitlock, CEO of Meridian Capital", places: ["the lobby","the server room","the cafeteria","the rooftop","the parking deck","the boardroom"] },
  { name: "The Aurora Cruise", scene: "the captain's suite", victim: "Captain Lars Berg", places: ["the galley","the casino","the engine room","the promenade deck","the spa","the bridge"] },
  { name: "Greywater Museum", scene: "the vault gallery", victim: "curator Helen Ashby", places: ["the cafe","the gift shop","the loading dock","the east hall","the archive","the courtyard"] },
];

const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
function rng(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const liars = (segs: Seg[][], recs: Rec[]) =>
  segs.map((_, i) => i).filter(i => recs.some(rc => rc.who === i && segs[i].some(g => rc.at >= g.from && rc.at <= g.to && rc.place !== g.place)));

function build(level: number, attempt: number) {
  const R = rng(level * 7919 + attempt * 104729 + 12345);
  const int = (a: number, b: number) => a + Math.floor(R() * (b - a + 1));
  const shuf = <T>(a: T[]): T[] => { const x = [...a]; for (let i = x.length - 1; i > 0; i--) { const j = int(0, i); [x[i], x[j]] = [x[j], x[i]]; } return x; };
  const tier = level <= 33 ? 1 : level <= 66 ? 2 : 3;
  const n = 4 + Math.floor((level - 1) / 25);
  const th = THEMES[(level - 1) % THEMES.length];
  const w0 = int(1230, 1320), w1 = w0 + int(15, 25), disc = w1 + int(20, 35);
  const fs = shuf(FIRST), ls = shuf(LAST), roles = shuf(ROLES), mots = shuf(MOTIVES);
  const culprit = int(0, n - 1);
  const codes = Array.from({ length: n }, (_, i) => `#${(i + 1) * 1000 + int(0, 999)}`);
  const people = Array.from({ length: n }, (_, i) => ({ name: `${fs[i]} ${ls[i]}`, role: roles[i], motive: mots[i], segs: [] as Seg[] }));
  const recs: Rec[] = [];

  people.forEach((p, i) => {
    const place = th.places[int(0, th.places.length - 1)];
    const to = w1 + int(15, 40);
    if (i === culprit) { // the lie: claims another room, but a record puts them at the scene inside the window
      p.segs = [{ place, from: w0 - int(20, 50), to }];
      recs.push({ who: i, place: th.scene, at: int(w0 + 2, w1 - 2) });
      return;
    }
    const decoy = tier > 1 && R() < (tier === 2 ? 0.3 : 0.5);      // honest earlier visit to the scene (red herring)
    const verified = tier === 1 || R() > (tier === 2 ? 0.35 : 0.5); // some innocents have no alibi record
    if (decoy) {
      const v1 = w0 - int(12, 30), v0 = v1 - int(15, 30);
      p.segs = [{ place: th.scene, from: v0, to: v1 }, { place, from: v1, to }];
      recs.push({ who: i, place: th.scene, at: int(v0 + 2, v1 - 2) });
    } else p.segs = [{ place, from: w0 - int(20, 50), to }];
    if (verified) recs.push({ who: i, place, at: int(w0, w1) });
  });

  const ident = (i: number) => (tier === 1 ? people[i].name : `badge ${codes[i]}`);
  const kinds = ["Door reader", "Camera", "Access log"];
  const items: { time: string; text: string }[] = recs.map(rc => ({ time: fmt(rc.at), text: `${kinds[int(0, 2)]}, ${rc.place}: ${ident(rc.who)} at ${fmt(rc.at)}.` }));
  if (tier > 1) Array.from(new Set(recs.map(rc => rc.who))).forEach(i => items.push({ time: "Registry", text: `Badge directory: ${codes[i]} is issued to ${people[i].name}.` }));
  const evidence = [{ time: `${fmt(w0)}–${fmt(w1)}`, text: `Medical examiner: time of death falls in this window, in ${th.scene}.` }, ...shuf(items)]
    .map((e, k) => ({ id: `E${k + 1}`, ...e }));

  const crec = recs.find(rc => rc.who === culprit)!;
  const others = shuf(people.map((_, i) => i).filter(i => i !== culprit));
  const pub: PublicCase = {
    level, title: `Case ${level}: ${th.name}`, difficulty: tier === 1 ? "Straightforward" : tier === 2 ? "Tricky" : "Brutal",
    intro: `${th.victim} was found dead in ${th.scene} at ${fmt(disc)}. The examiner places the death between ${fmt(w0)} and ${fmt(w1)}. ${n} people were in the building. One of them is lying, and the lie is built to look routine.`,
    evidence,
    suspects: people.map((p, i) => ({ id: `s${i}`, name: p.name, role: p.role,
      statement: p.segs.map(g => `I was in ${g.place} from ${fmt(g.from)} to ${fmt(g.to)}.`).join(" ") + ` I'll admit I ${p.motive}.` })),
    hints: ["Exactly one statement is contradicted by a record. Compare where each person says they were with what the records show.",
      `${people[others[0]].name} is not the culprit.`, `${people[others[1]].name} is not the culprit.`],
  };
  const sol: Solution = { culpritId: `s${culprit}`, breakdown: people.map((p, i) => ({
    suspectId: `s${i}`,
    verdict: i === culprit ? "Culprit" : "Cleared",
    note: i === culprit
      ? `Claimed to be in ${p.segs[0].place} from ${fmt(p.segs[0].from)} to ${fmt(p.segs[0].to)}, but a record puts them in ${th.scene} at ${fmt(crec.at)}, inside the ${fmt(w0)}–${fmt(w1)} window.`
      : p.segs.length > 1 ? "Admitted an earlier visit to the scene. The record matches, and it shows they left before the window."
      : recs.some(rc => rc.who === i) ? "A record backs up their statement."
      : "Nothing contradicts their statement. The only contradiction belongs to someone else.",
  })) };
  return { pub, sol, ok: (() => { const l = liars(people.map(p => p.segs), recs); return l.length === 1 && l[0] === culprit; })() };
}

export function generate(level: number) {
  const lv = Math.min(100, Math.max(1, Math.floor(level) || 1));
  for (let attempt = 0; ; attempt++) { const r = build(lv, attempt); if (r.ok) return r; }
}
