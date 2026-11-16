import { Suspense } from "react";
import type { Metadata } from "next";
import AppStore from "@/components/AppStore";
import { Wave } from "@/components/Icons";
import { getApps } from "@/lib/data";
import JumpText from "@/components/JumpText";

export const revalidate = 60;
export const metadata: Metadata = { title: "The Bala App Store", description: "Every app Bala builds, and the problem each one solves. Filter by what you want to learn or fix.", alternates: { canonical: "/apps" } };

export default async function AppsPage() {
  const apps = await getApps();
  return (
    <>
      <section className="band tiled violet" style={{ paddingTop: 64, paddingBottom: 104 }}>
        <div className="wrap center stack" style={{ gap: 14 }}>
          <span className="eyebrow">The Bala App Store</span>
          <JumpText as="h1" playOnLoad className="display h1" style={{ lineHeight: 1 }} text="Every app. Every problem it solves." />
          <p className="lede" style={{ margin: 0, maxWidth: 640 }}>{apps.length} live apps, open-source tools and experiments. Filter by what you want to learn or fix.</p>
        </div>
        <Wave />
      </section>
      <section className="band alt" style={{ paddingTop: 56 }}>
        <div className="wrap"><Suspense fallback={<div className="skeleton" style={{ height: 480 }} />}><AppStore apps={apps} /></Suspense></div>
      </section>
    </>
  );
}
