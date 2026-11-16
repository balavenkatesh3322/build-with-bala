import { ImageResponse } from "next/og";
import { appsData } from "@/lib/apps-data";
import { categoryById, site, statusLabel } from "@/lib/site";
import { LogoMark, OG_SIZE, ogBackground, ogFonts, publicImage } from "@/lib/og";
import { appDetails } from "@/lib/app-details";

export const alt = "Build with Bala app preview card";
export const size = OG_SIZE;
export const contentType = "image/png";
export function generateStaticParams() { return appsData.map((a) => ({ slug: a.slug })); }

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const app = appsData.find((a) => a.slug === slug);
  if (!app) return new ImageResponse(<div style={{ ...ogBackground }} />, size);
  const shot = await publicImage(app.poster ?? appDetails[slug]?.shots[0]?.src);
  const cat = categoryById(app.category);
  return new ImageResponse(
    (
      <div style={{ ...ogBackground, padding: 64, gap: 48, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 30 }}>
            <LogoMark size={48} /><span style={{ fontSize: 28, fontWeight: 700 }}>{site.name}</span>
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            <span style={{ fontSize: 20, padding: "6px 14px", borderRadius: 999, background: "#d81b60" }}>{statusLabel[app.status]}</span>
            <span style={{ fontSize: 20, padding: "6px 14px", borderRadius: 999, border: "2px solid rgba(255,255,255,.2)", color: "#aab4c6" }}>{cat.label}</span>
          </div>
          <div style={{ fontSize: 64, fontWeight: 800, letterSpacing: -2, lineHeight: 1.02 }}>{app.name}</div>
          <div style={{ marginTop: 22, fontSize: 28, fontWeight: 600, color: "#aab4c6", lineHeight: 1.35 }}>{app.hook}</div>
          <div style={{ marginTop: 30, fontSize: 22, color: "#f06695" }}>Free · Try it on the Bala App Store</div>
        </div>
        {shot ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shot} width={500} height={281} style={{ borderRadius: 18, border: "2px solid rgba(255,255,255,.12)", objectFit: "cover", boxShadow: "0 30px 60px rgba(0,0,0,.5)" }} alt="" />
        ) : (
          <div style={{ display: "flex", width: 440, height: 300, borderRadius: 24, alignItems: "center", justifyContent: "center", background: cat.grad, fontSize: 110, fontWeight: 800 }}>
            {app.name.split(/\s+/).slice(0, 3).map((w) => w[0]).join("").toUpperCase()}
          </div>
        )}
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
