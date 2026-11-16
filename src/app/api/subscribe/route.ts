import { z } from "zod";
import { adminDb } from "@/lib/supabase";
import { json, notConfigured } from "@/lib/api";
import { site } from "@/lib/site";

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  source: z.string().max(60).optional(),
  website: z.string().optional(), // honeypot: bots fill this in
});

async function welcome(email: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || `${site.name} <onboarding@resend.dev>`,
        to: email,
        subject: `Welcome to ${site.name}`,
        html: `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto;line-height:1.6">
          <h2>You're in. 🎉</h2>
          <p>Thanks for subscribing to <strong>${site.name}</strong>. You'll get one new AI app and one idea every week.</p>
          <p>Try today's quiz: <a href="${site.url}/today">${site.url}/today</a></p>
          <p style="color:#666;font-size:13px">Reply to this email or chat on WhatsApp any time.</p></div>`,
      }),
    });
  } catch {
    /* a failed welcome email must never fail the signup */
  }
}

export async function POST(req: Request) {
  const db = adminDb();
  if (!db) return notConfigured();
  let body: unknown;
  try { body = await req.json(); } catch { return json({ ok: false, error: "Bad request" }, 400); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return json({ ok: false, error: "Please enter a valid email address." }, 400);
  if (parsed.data.website) return json({ ok: true }); // honeypot hit: pretend success

  const { email, source } = parsed.data;
  const { data: existing } = await db.from("subscribers").select("id").eq("email", email).maybeSingle();
  if (existing) return json({ ok: true, already: true });

  const { error } = await db.from("subscribers").insert({ email, source: source ?? null });
  if (error) return json({ ok: false, error: "Could not subscribe right now. Please try again." }, 500);
  await welcome(email);
  return json({ ok: true });
}
