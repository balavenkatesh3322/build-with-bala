import { ImageResponse } from "next/og";
import { LogoMark } from "@/lib/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (<div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", background: "#16151c" }}><LogoMark size={128} /></div>),
    size,
  );
}
