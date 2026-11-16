import { ImageResponse } from "next/og";
import { LogoMark, OG_SIZE, ogBackground, ogFonts } from "@/lib/og";
import { site } from "@/lib/site";
import { appsData } from "@/lib/apps-data";

export const alt = `${site.name}: ${site.tagline}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ ...ogBackground, flexDirection: "column", justifyContent: "center", padding: "0 90px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 36 }}>
          <LogoMark size={76} />
          <span style={{ fontSize: 40, fontWeight: 700 }}>{site.name}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", fontSize: 88, fontWeight: 800, lineHeight: 1, letterSpacing: -3 }}>
          <span>Learn&nbsp;</span><span style={{ color: "#e91e63" }}>AI</span><span>.&nbsp;Build with&nbsp;</span><span style={{ color: "#e91e63" }}>Bala</span><span>.</span>
        </div>
        <div style={{ marginTop: 34, fontSize: 32, fontWeight: 600, color: "#aab4c6", maxWidth: 960, lineHeight: 1.35 }}>
          The Bala App Store: interactive AI apps, 3D explainers, tools and games. Free to try.
        </div>
        <div style={{ position: "absolute", bottom: 50, left: 90, display: "flex", gap: 14, fontSize: 24, color: "#f06695" }}>
          <span>{appsData.length} apps</span><span style={{ color: "#5f6878" }}>·</span><span>Learn in 3D</span><span style={{ color: "#5f6878" }}>·</span><span>New app every week</span>
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
