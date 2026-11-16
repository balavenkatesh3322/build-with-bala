import type { AppRow } from "./data";

export const initials = (name: string) => {
  const words = name.replace(/[^A-Za-z0-9 ]/g, " ").split(" ").filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.slice(0, 3).map((w) => w[0]).join("").toUpperCase();
};

/** Where an app's primary button should go. */
export function appCta(app: AppRow): { href: string; external: boolean } {
  if (app.status === "live" && app.liveUrl) return { href: app.liveUrl, external: true };
  if (app.status === "coming") return { href: "/#subscribe", external: false };
  if (app.repoUrl) return { href: app.repoUrl, external: true };
  if (app.liveUrl) return { href: app.liveUrl, external: true };
  return { href: `/apps/${app.slug}`, external: false };
}
