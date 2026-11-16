import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_SIZE = { width: 1200, height: 630 };

/** Brand font (Outfit, SIL OFL) for social cards. */
export async function ogFonts() {
  const dir = join(process.cwd(), "src", "assets", "fonts");
  const [semi, heavy] = await Promise.all([readFile(join(dir, "outfit-600.ttf")), readFile(join(dir, "outfit-800.ttf"))]);
  return [
    { name: "Outfit", data: semi, weight: 600 as const, style: "normal" as const },
    { name: "Outfit", data: heavy, weight: 800 as const, style: "normal" as const },
  ];
}

export async function publicImage(path: string | null | undefined): Promise<string | null> {
  if (!path || !path.startsWith("/")) return null;
  try {
    const buf = await readFile(join(process.cwd(), "public", path));
    const type = path.endsWith(".png") ? "image/png" : "image/jpeg";
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch { return null; }
}

export function LogoMark({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <path d="M16 2 29 9.5v13L16 30 3 22.5v-13z" fill="#D81B60" />
      <path d="M16 2 29 9.5 16 17 3 9.5z" fill="#FF6FA0" />
      <path d="M16 17v13l13-7.5v-13z" fill="#8B7CF6" />
      <path d="M12.5 13.2 9.8 16l2.7 2.8M19.5 13.2l2.7 2.8-2.7 2.8" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Shared dark card background: grid + pink/violet glow, like the site hero. */
export const ogBackground = {
  display: "flex", width: "100%", height: "100%", position: "relative" as const, color: "#fff", fontFamily: "Outfit",
  backgroundColor: "#14131c",
  backgroundImage: "radial-gradient(circle at 20% 30%, rgba(233,30,99,.28), transparent 45%), radial-gradient(circle at 85% 80%, rgba(139,124,246,.28), transparent 45%)",
};
