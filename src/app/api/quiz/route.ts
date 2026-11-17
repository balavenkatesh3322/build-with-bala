import { NextRequest } from "next/server";
import { ctx, json } from "@/lib/api";
import { adminDb } from "@/lib/supabase";
import { showcaseQuizTotal } from "@/lib/seed";
import { quizStoreKey, todaysQuiz } from "@/lib/daily";

const statsFor = async (key: string) => {
  const db = adminDb();
  if (!db) { const total = showcaseQuizTotal(key); return { total, correctCount: Math.round(total * 0.58) }; }
  const { data } = await db.from("quiz_stats").select("total, correct").eq("quiz_key", key).maybeSingle();
  return { total: data?.total ?? 0, correctCount: data?.correct ?? 0 };
};

export async function GET() {
  return json({ ok: true, ...(await statsFor(quizStoreKey(todaysQuiz()))) });
}

/** The server grades the answer, so the client can't fake "correct". */
export async function POST(req: NextRequest) {
  const quiz = todaysQuiz();
  const key = quizStoreKey(quiz);
  let option = -1; let sent = "";
  try { const b = await req.json(); option = Number(b.option); sent = String(b.key ?? ""); } catch { /* handled below */ }
  if (sent !== quiz.key) return json({ ok: false, stale: true, error: "A new quiz is live. Please refresh the page." }, 409);
  if (!Number.isInteger(option) || option < 0 || option >= quiz.options.length) return json({ ok: false, error: "Invalid option" }, 400);

  const correct = option === quiz.answer;
  const c = await ctx();
  if ("error" in c) return json({ ok: true, demo: true, correct, answer: quiz.answer, explain: quiz.explain, app: quiz.app ?? null, ...(await statsFor(key)) });
  const { error } = await c.db.from("quiz_answers").insert({ quiz_key: key, option, correct, voter_id: c.voter });
  const already = error?.code === "23505";
  if (error && !already) return json({ ok: false, error: "Could not save your answer." }, 500);
  return json({ ok: true, already, correct, answer: quiz.answer, explain: quiz.explain, app: quiz.app ?? null, ...(await statsFor(key)) });
}
