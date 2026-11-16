import type { Metadata } from "next";
import TodayClient from "@/components/TodayClient";
import { todaysConcept, todaysPoll, todaysQuiz } from "@/lib/daily";

export const dynamic = "force-dynamic"; // content changes every day
export const metadata: Metadata = { title: "Today", description: "A new AI quiz, poll, concept and free resources every day. Five minutes, one new thing.", alternates: { canonical: "/today" } };

export default function TodayPage() {
  const quiz = todaysQuiz();
  const poll = todaysPoll();
  const concept = todaysConcept();
  const dateLabel = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
  const drops = [
    { kind: "PAPER · LEARN AI PAPERS", title: "Colour-coded research papers", blurb: "Key ideas highlighted. Ten minutes, not two hours.", href: "/apps/learn-ai-papers", external: false },
    { kind: "FREE CERTIFICATE", title: "Free AI certifications", blurb: "Verifiable and free, from top universities and companies.", href: "https://balavenkatesh3322.github.io/free-ai-certification/", external: true },
    { kind: "OPEN MODEL · LLM REGISTRY", title: "Find an open model that fits your GPU", blurb: "Licence, benchmarks and the hardware needed to run it.", href: "https://balavenkatesh3322.github.io/open-llm-registry/", external: true },
  ];
  // never send the answer or explanation to the browser before it answers
  return <TodayClient quiz={{ key: quiz.key, question: quiz.question, options: quiz.options }} poll={{ key: poll.key, question: poll.question, options: poll.options }} drops={drops} concept={concept} dateLabel={dateLabel} />;
}
