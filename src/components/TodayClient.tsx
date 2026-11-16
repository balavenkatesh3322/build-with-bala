"use client";
import { Wave } from "./Icons";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LEVEL_AT, level, todayStr, useProgress } from "@/lib/progress";
import { useVotes } from "./VotesProvider";
import JumpText from "./JumpText";

type QuizPublic = { key: string; question: string; options: string[] };
type PollPublic = { key: string; question: string; options: string[] };
type Drop = { kind: string; title: string; blurb: string; href: string; external: boolean };
type Result = { correct: boolean; answer: number; explain: string; app: string | null; total: number; correctCount: number };

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

export default function TodayClient({ quiz, poll, drops, concept, dateLabel }: { quiz: QuizPublic; poll: PollPublic; drops: Drop[]; concept: { slug: string; title: string; blurb: string }; dateLabel: string }) {
  const { p, ready, update, award, checkIn } = useProgress();
  const { notify } = useVotes();
  const day = todayStr();
  const [picked, setPicked] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [counts, setCounts] = useState<number[] | null>(null);
  const [voted, setVoted] = useState<number | null>(null);
  const [answeredToday, setAnsweredToday] = useState<number | null>(null);

  // restore today's answers from this browser
  useEffect(() => {
    if (!ready) return;
    if (p.quiz?.day === day) { setPicked(p.quiz.option); setResult({ correct: p.quiz.correct, answer: p.quiz.answer, explain: p.quiz.explain, app: p.quiz.app, total: 0, correctCount: 0 }); }
    if (p.poll?.day === day) setVoted(p.poll.option);
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetch("/api/quiz").then((r) => r.json()).then((d) => setAnsweredToday(d.total ?? 0)).catch(() => {});
    fetch("/api/poll").then((r) => r.json()).then((d) => d.counts && setCounts(d.counts)).catch(() => {});
  }, []);

  async function answer(option: number) {
    if (result) return;
    setPicked(option);
    try {
      const res = await fetch("/api/quiz", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: quiz.key, option }) });
      const d = await res.json();
      if (!res.ok || !d.ok) throw new Error(d.error || "Could not save your answer.");
      const r: Result = { correct: d.correct, answer: d.answer, explain: d.explain, app: d.app, total: d.total, correctCount: d.correctCount ?? 0 };
      setResult({ ...r, correct: d.correct });
      setAnsweredToday(d.total);
      award("quiz", 10);
      update((cur) => ({ ...cur, quizCorrect: cur.quizCorrect + (d.correct && !d.already ? 1 : 0), quiz: { day, option, correct: d.correct, answer: d.answer, explain: d.explain, app: d.app } }));
    } catch (e) { setPicked(null); notify(e instanceof Error ? e.message : "Could not save your answer."); }
  }

  async function vote(option: number) {
    if (voted !== null) return;
    setVoted(option);
    try {
      const res = await fetch("/api/poll", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: poll.key, option }) });
      const d = await res.json();
      if (!res.ok || !d.ok) throw new Error(d.error || "Could not save your vote.");
      setCounts(d.counts); award("poll", 5); update((cur) => ({ ...cur, poll: { day, option } }));
    } catch (e) { setVoted(null); notify(e instanceof Error ? e.message : "Could not save your vote."); }
  }

  const checked = p.last === day;
  const total = counts ? counts.reduce((a, b) => a + b, 0) : 0;
  const weekStart = (() => { const d = new Date(day + "T00:00:00Z"); const dow = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - dow); return d; })();
  const weekDays = DAYS.map((_, i) => { const d = new Date(weekStart); d.setUTCDate(d.getUTCDate() + i); return d.toISOString().slice(0, 10); });
  const lv = level(p.xp);
  const badges = [
    { name: "7-day streak", on: p.best >= 7 }, { name: "first idea", on: p.ideas >= 1 },
    { name: "quiz ace ×5", on: p.quizCorrect >= 5 }, { name: "idea shipped", on: false },
  ];
  const shareText = result ? `${result.correct ? "I got today's AI quiz right" : "I just tried today's AI quiz"} on Build with Bala. Can you?` : "";

  return (
    <>
      <section className="band tiled" style={{ paddingTop: 56, paddingBottom: 104 }}>
        <div className="wrap row" style={{ alignItems: "flex-end", justifyContent: "space-between", gap: 32 }}>
          <div className="stack" style={{ flex: "1 1 560px", minWidth: 0, gap: 14 }}>
            <span className="eyebrow">Today · {dateLabel}</span>
            <JumpText as="h1" playOnLoad className="display h1" style={{ lineHeight: 1 }} segments={[{ text: "Five minutes." }, { text: "One new thing", accent: true, squiggle: true }, { text: ".", glue: true }]} />
            <p className="lede" style={{ margin: 0 }}>A quiz, a poll, a concept in 3D and free resources, fresh every day.</p>
          </div>
          <button type="button" className={`btn btn-lg ${checked ? "btn-ghost" : "btn-accent"}`} onClick={checkIn} disabled={checked}>
            {checked ? `✓ Checked in · day ${p.streak}` : "Check in for today · +5 XP"}
          </button>
        </div>
        <Wave />
      </section>

      <section className="band alt" style={{ paddingTop: 56 }}>
        <div className="wrap row" style={{ gap: 28, alignItems: "flex-start" }}>
          <div className="stack" style={{ flex: "999 1 660px", minWidth: 0, gap: 22 }}>
            {/* QUIZ */}
            <div className="card stack" style={{ padding: 28, gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <span className="eyebrow">Daily quiz · +10 XP</span>
                <span className="mono faint" style={{ fontSize: 12 }}>{answeredToday ? `${answeredToday} answered today` : "Be the first today"}</span>
              </div>
              <h2 className="display" style={{ fontSize: 26, lineHeight: 1.25, fontWeight: 600 }}>{quiz.question}</h2>
              <div className="g2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
                {quiz.options.map((o, i) => {
                  const done = result !== null;
                  const right = done && i === result.answer;
                  const wrong = done && i === picked && !right;
                  return (
                    <button key={i} type="button" disabled={done || (picked !== null && !done)} onClick={() => answer(i)} aria-pressed={picked === i}
                      style={{ minHeight: 54, padding: "12px 16px", borderRadius: 12, display: "flex", alignItems: "center", gap: 12, textAlign: "left", fontWeight: 500, fontSize: 15, color: "var(--ink)",
                        background: right ? "color-mix(in srgb, var(--ok) 16%, transparent)" : wrong ? "var(--accent-soft)" : "var(--field)",
                        border: `1px solid ${right ? "var(--ok)" : wrong ? "var(--accent)" : "var(--line)"}` }}>
                      <span className="mono faint" style={{ fontSize: 12 }}>{"ABCD"[i]}</span>{o}
                    </button>
                  );
                })}
              </div>
              {result && (
                <div className="code" style={{ padding: "16px 18px" }} role="status">
                  <div><span className="k">result</span>: <span className="s">&quot;{result.correct ? `correct · +10 XP` : `not quite · answer is ${"ABCD"[result.answer]}`}&quot;</span></div>
                  <div style={{ fontFamily: "var(--font-body)", marginTop: 6, color: "var(--ink2)" }}>{result.explain}</div>
                  <div style={{ fontFamily: "var(--font-body)", marginTop: 10, display: "flex", flexWrap: "wrap", gap: 16 }}>
                    <a style={{ color: "var(--accent-text)", fontWeight: 500 }} target="_blank" rel="noopener noreferrer" href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + (typeof window !== "undefined" ? window.location.href : ""))}`}>Share my result ↗</a>
                    {result.app && <Link style={{ color: "var(--accent-text)", fontWeight: 500 }} href={`/apps/${result.app}`}>See the app behind this →</Link>}
                  </div>
                </div>
              )}
            </div>

            {/* POLL */}
            <div className="card stack" style={{ padding: 28, gap: 14, background: "linear-gradient(160deg, color-mix(in srgb, var(--violet) 12%, transparent), var(--surface) 55%)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}><span className="eyebrow" style={{ color: "var(--violet)" }}>Daily poll · +5 XP</span><span className="mono faint" style={{ fontSize: 12 }}>results guide what I build</span></div>
              <h2 className="display" style={{ fontSize: 26, fontWeight: 600 }}>{poll.question}</h2>
              <div className="stack" style={{ gap: 8 }}>
                {poll.options.map((o, i) => {
                  const n = counts?.[i] ?? 0; const pct = total ? Math.round((n / total) * 100) : 0; const show = voted !== null;
                  return (
                    <button key={i} type="button" onClick={() => vote(i)} disabled={show} aria-pressed={voted === i}
                      style={{ position: "relative", overflow: "hidden", minHeight: 50, padding: "0 16px", borderRadius: 12, display: "flex", alignItems: "center", gap: 12, fontWeight: 500, fontSize: 15, color: "var(--ink)", background: "var(--surface)", border: `1px solid ${voted === i ? "var(--accent)" : "var(--line)"}` }}>
                      {show && <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: voted === i ? "var(--accent-soft)" : "color-mix(in srgb, var(--violet) 12%, transparent)", transition: "width .6s" }} />}
                      <span style={{ position: "relative", flex: 1, textAlign: "left" }}>{o}</span>
                      {show && <span className="mono" style={{ position: "relative", fontSize: 13 }}>{pct}%</span>}
                    </button>
                  );
                })}
              </div>
              {voted !== null && <Link href="/ideas" style={{ color: "var(--accent-text)", fontWeight: 500, fontSize: 14 }}>Tell me more about your blocker (+20 XP) →</Link>}
            </div>

            {/* DROPS */}
            <div>
              <span className="eyebrow">Free drops</span>
              <h2 className="display h3" style={{ margin: "10px 0 16px" }}>Today&apos;s picks.</h2>
              <div className="g2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
                <Link href={`/apps/${concept.slug}`} className="card hov stack" style={{ padding: 18, gap: 6 }}>
                  <span className="mono" style={{ fontSize: 11, letterSpacing: ".1em", color: "var(--accent-text)" }}>CONCEPT IN 3D</span>
                  <span className="display" style={{ fontSize: 18, fontWeight: 600 }}>{concept.title}</span><span className="muted" style={{ fontSize: 14 }}>{concept.blurb}</span>
                </Link>
                {drops.map((d) => {
                  const inner = (<><span className="mono" style={{ fontSize: 11, letterSpacing: ".1em", color: "var(--accent-text)" }}>{d.kind}</span><span className="display" style={{ fontSize: 18, fontWeight: 600 }}>{d.title}</span><span className="muted" style={{ fontSize: 14 }}>{d.blurb}</span></>);
                  return d.external
                    ? <a key={d.title} href={d.href} target="_blank" rel="noopener noreferrer" className="card hov stack" style={{ padding: 18, gap: 6 }}>{inner}</a>
                    : <Link key={d.title} href={d.href} className="card hov stack" style={{ padding: 18, gap: 6 }}>{inner}</Link>;
                })}
              </div>
            </div>
          </div>

          <aside className="stack" style={{ flex: "1 1 320px", minWidth: 0, gap: 14 }}>
            <div className="card stack" style={{ padding: 22, gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span className="display" style={{ fontSize: 19, fontWeight: 600 }}>Your streak</span><span className="mono faint" style={{ fontSize: 12 }}>best {p.best}</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 6, textAlign: "center", fontSize: 11 }} className="faint">
                {weekDays.map((d, i) => (
                  <span key={d} style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
                    <span style={{ width: 30, height: 30, borderRadius: 8, background: p.days.includes(d) ? "var(--accent)" : "var(--field)", border: d === day && !p.days.includes(d) ? "2px dashed var(--accent)" : "none" }} />{DAYS[i]}
                  </span>
                ))}
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}><strong>{p.xp} XP · {lv}</strong><span className="faint">{p.xp >= LEVEL_AT ? "max level" : `${LEVEL_AT} → Maker`}</span></div>
                <div style={{ height: 8, borderRadius: 999, background: "var(--field)", overflow: "hidden" }}><div style={{ width: `${Math.min(100, (p.xp / LEVEL_AT) * 100)}%`, height: 8, background: "linear-gradient(90deg, var(--accent), var(--violet))" }} /></div>
              </div>
              <div className="row" style={{ gap: 6 }}>{badges.map((b) => (<span key={b.name} className="chip" style={b.on ? { color: "var(--accent-text)", borderColor: "var(--accent-line)" } : { borderStyle: "dashed" }}>{b.name}{b.on ? "" : " 🔒"}</span>))}</div>
              <p className="faint" style={{ margin: 0, fontSize: 12 }}>Saved in this browser. No account needed.</p>
            </div>
            <div className="code" style={{ padding: "18px 20px" }}>
              <div className="c">{"// ways to earn XP"}</div>
              <div><span className="k">checkIn</span>()      <span className="n">+5</span></div>
              <div><span className="k">answerQuiz</span>()   <span className="n">+10</span></div>
              <div><span className="k">votePoll</span>()     <span className="n">+5</span></div>
              <div><span className="k">shareIdea</span>()    <span className="n">+20</span></div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
