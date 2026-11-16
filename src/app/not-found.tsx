import Link from "next/link";

export default function NotFound() {
  return (
    <section className="band tiled" style={{ minHeight: "60vh", display: "flex", alignItems: "center" }}>
      <div className="wrap center stack" style={{ gap: 16 }}>
        <span className="eyebrow">404</span>
        <h1 className="display h1">This page wandered off.</h1>
        <p className="lede" style={{ margin: 0 }}>Let&apos;s get you back to the apps.</p>
        <div className="row" style={{ gap: 12, justifyContent: "center" }}><Link href="/" className="btn btn-accent btn-lg">Home</Link><Link href="/apps" className="btn btn-ghost btn-lg">Open the App Store</Link></div>
      </div>
    </section>
  );
}
