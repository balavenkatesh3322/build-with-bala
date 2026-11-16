type P = { size?: number; className?: string };
const base = (size = 18) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true });

export const IconUp = ({ size = 14 }: P) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 5 4 16h16z" /></svg>);
export const IconPlay = ({ size = 28 }: P) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>);
export const IconSearch = ({ size }: P) => (<svg {...base(size)}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>);
export const IconMenu = ({ size }: P) => (<svg {...base(size)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>);
export const IconClose = ({ size }: P) => (<svg {...base(size)}><path d="M6 6l12 12M18 6 6 18" /></svg>);
export const IconSun = ({ size }: P) => (<svg {...base(size)}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>);
export const IconMoon = ({ size }: P) => (<svg {...base(size)}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>);
export const IconExternal = ({ size = 14 }: P) => (<svg {...base(size)}><path d="M7 17 17 7M8 7h9v9" /></svg>);
export const IconShare = ({ size }: P) => (<svg {...base(size)}><path d="M12 3v13M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" /></svg>);
export const IconCheck = ({ size }: P) => (<svg {...base(size)}><path d="m5 12 5 5L20 7" /></svg>);
export const IconWhatsApp = ({ size = 26 }: P) => (<svg {...base(size)}><path d="M3 21l1.7-5A8.5 8.5 0 1 1 8 19.4z" /><path d="M9 9.5c.3 2 2 4 4.5 4.8l1.2-1.2 2 .8v1.6c-3.8.6-8.2-3.6-8-7.5h1.7l.6 2z" /></svg>);
export const IconPause = ({ size = 12 }: P) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>);
export const IconStar = ({ size = 14 }: P) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" /></svg>);

export function Logo({ size = 32 }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 2 29 9.5v13L16 30 3 22.5v-13z" fill="var(--accent)" />
      <path d="M16 2 29 9.5 16 17 3 9.5z" fill="var(--logo-top)" />
      <path d="M16 17v13l13-7.5v-13z" fill="var(--violet)" />
      <path d="M12.5 13.2 9.8 16l2.7 2.8M19.5 13.2l2.7 2.8-2.7 2.8" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
/** Drifting wave edge between bands (two periods wide so the loop is seamless). */
export function Wave({ to }: { to?: string }) {
  return (
    <div className="wave" aria-hidden="true">
      <svg viewBox="0 0 2880 56" preserveAspectRatio="none"><path d="M0 28C240 8 480 8 720 28S1200 48 1440 28S1920 8 2160 28S2640 48 2880 28V56H0Z" style={to ? { fill: to } : undefined} /></svg>
    </div>
  );
}
