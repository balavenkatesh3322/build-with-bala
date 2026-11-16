import Link from "next/link";
import { Logo } from "./Icons";
import { site, whatsappLink } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap row" style={{ padding: "56px 24px 32px", gap: 40 }}>
        <div className="stack" style={{ flex: "1 1 260px", gap: 12 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}><Logo size={28} /><span className="display" style={{ fontSize: 22 }}>{site.name}</span></span>
          <span className="faint" style={{ fontSize: 14, lineHeight: 1.6, maxWidth: 300 }}>The Bala App Store. Learn AI by trying, and building, real apps. Made by {site.owner}.</span>
        </div>
        <div className="f-col"><h4>EXPLORE</h4><Link className="nav-a" href="/apps">App Store</Link><Link className="nav-a" href="/today">Today</Link><Link className="nav-a" href="/ideas">Ideas</Link><Link className="nav-a" href="/blog">Blog</Link></div>
        <div className="f-col"><h4>LEARN IN 3D</h4><Link className="nav-a" href="/apps/agentdecode-3d">AgentDecode 3D</Link><Link className="nav-a" href="/apps/neuraldecode-3d">NeuralDecode 3D</Link><Link className="nav-a" href="/apps/3d-agent-lab">3D Agent Lab</Link></div>
        <div className="f-col"><h4>COMMUNITY</h4>
          <a className="nav-a" href={site.socials.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
          <a className="nav-a" href={site.socials.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a className="nav-a" href={site.socials.x} target="_blank" rel="noopener noreferrer">X</a>
          <a className="nav-a" href={site.socials.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a className="nav-a" href={site.socials.medium} target="_blank" rel="noopener noreferrer">Medium</a></div>
        <div className="f-col"><h4>ABOUT</h4><a className="nav-a" href={site.portfolio} target="_blank" rel="noopener noreferrer">About Bala ↗</a><a className="nav-a" href={whatsappLink()} target="_blank" rel="noopener noreferrer">WhatsApp</a></div>
      </div>
      <div className="wrap faint" style={{ padding: "20px 24px 32px", borderTop: "1px solid var(--line)", fontSize: 13 }}>© {new Date().getFullYear()} {site.name} · Free AI apps by {site.owner}</div>
    </footer>
  );
}
