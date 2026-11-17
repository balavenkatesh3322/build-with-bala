// Stable "showcase" numbers used while live counting isn't available.
// The same input always gives the same number, so counts don't jump between visits.
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/** A believable upvote count for an app: 60–420, a bit higher for featured apps. */
export function showcaseVotes(slug: string, featured = false) {
  return 60 + (hash(slug) % 300) + (featured ? 120 : 0);
}

/** A believable vote count for an idea: 18–260. */
export function showcaseIdeaVotes(id: string) {
  return 18 + (hash(`idea:${id}`) % 242);
}

/** Believable poll results for today's poll. */
export function showcasePoll(key: string, options: number) {
  return Array.from({ length: options }, (_, i) => 12 + (hash(`${key}:${i}`) % 140));
}

/** A believable number of quiz answers today. */
export function showcaseQuizTotal(key: string) {
  return 40 + (hash(`quiz:${key}`) % 220);
}
