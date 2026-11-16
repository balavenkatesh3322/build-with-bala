"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import SearchDialog from "./SearchDialog";
import { IconClose, IconExternal, IconMenu, IconSearch, Logo } from "./Icons";
import { site } from "@/lib/site";

const links = [
  { href: "/apps", label: "App Store" },
  { href: "/today", label: "Today" },
  { href: "/ideas", label: "Ideas" },
  { href: "/blog", label: "Blog" },
];

export default function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);

  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearch(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="nav">
      <nav className="nav-in" aria-label="Main">
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10 }} aria-label={`${site.name} home`}>
          <Logo size={32} /><span className="display" style={{ fontSize: 21 }}>{site.name}</span>
        </Link>
        <div className={`nav-links${open ? " open" : ""}`}>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="nav-a" aria-current={path === l.href || path.startsWith(l.href + "/") ? "page" : undefined}>{l.label}</Link>
          ))}
          <a href={site.portfolio} target="_blank" rel="noopener noreferrer" className="nav-a" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>About Bala <IconExternal size={12} /></a>
        </div>
        <span className="nav-spacer" />
        <div className="nav-actions">
          <button type="button" className="icon-btn hide-sm" onClick={() => setSearch(true)} aria-label="Search (Ctrl or Cmd + K)" style={{ minWidth: 170, justifyContent: "space-between", background: "var(--field)", border: 0 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><IconSearch size={15} />Search</span>
            <kbd className="mono" style={{ fontSize: 11, border: "1px solid var(--line)", borderRadius: 6, padding: "1px 6px" }}>⌘K</kbd>
          </button>
          <button type="button" className="icon-btn burger" onClick={() => setSearch(true)} aria-label="Search"><IconSearch size={16} /></button>
          <ThemeToggle />
          <Link href="/#subscribe" className="btn btn-accent btn-sm hide-sm">Subscribe</Link>
          <button type="button" className="icon-btn burger" onClick={() => setOpen((o) => !o)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>{open ? <IconClose size={18} /> : <IconMenu size={18} />}</button>
        </div>
      </nav>
      {search && <SearchDialog onClose={() => setSearch(false)} />}
    </header>
  );
}
