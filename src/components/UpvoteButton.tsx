"use client";
import { IconUp } from "./Icons";
import { useVotes } from "./VotesProvider";

export function UpvoteButton({ slug, name, base, inline = false, label = false }: { slug: string; name: string; base: number; inline?: boolean; label?: boolean }) {
  const v = useVotes();
  const on = v.has("app", slug);
  return (
    <button type="button" className={`vote${on ? " on" : ""}${inline ? " row-v" : ""}`} aria-pressed={on} aria-label={`${on ? "Remove upvote from" : "Upvote"} ${name}`}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); v.toggle("app", slug, base); }}>
      <IconUp />
      <span>{label ? `Upvote · ${v.count("app", slug, base)}` : v.count("app", slug, base)}</span>
    </button>
  );
}

export function IdeaVoteButton({ id, title, base, cta }: { id: string; title: string; base: number; cta: [string, string] }) {
  const v = useVotes();
  const on = v.has("idea", id);
  return (
    <button type="button" className={`vote${on ? " on" : ""}`} style={{ width: 72, height: 64 }} aria-pressed={on} aria-label={`${on ? "Remove vote from" : "Vote for"}: ${title}`}
      onClick={() => v.toggle("idea", id, base)}>
      <span style={{ fontSize: 16 }}>{v.count("idea", id, base)}</span>
      <span style={{ fontSize: 11, fontWeight: 500 }}>{on ? cta[1] : cta[0]}</span>
    </button>
  );
}
