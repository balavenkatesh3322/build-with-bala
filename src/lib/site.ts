// Single place to change the brand.
export const site = {
  name: "Build with Bala",
  short: "BwB",
  tagline: "Learn AI. Build with Bala.",
  description:
    "The Bala App Store: interactive AI apps, 3D explainers, tools and games by Bala Venkatesh. Try any app in seconds, see the problem it solves, and learn how it was built.",
  // Explicit URL wins; on Vercel fall back to the production domain, then the preview URL.
  url: (process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
    || (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`)
    || "http://localhost:3000").replace(/\/$/, ""),
  owner: "Bala Venkatesh",
  portfolio: "https://balavenkatesh.is-a.dev/",
  whatsappNumber: "919003812808",
  whatsappText: "Hi Bala! I just visited Build with Bala.",
  socials: {
    instagram: "https://www.instagram.com/ai.with.bala/",
    github: "https://github.com/balavenkatesh3322",
    x: "https://x.com/balavenkatesh22",
    linkedin: "https://www.linkedin.com/in/bala-venkatesh-67964247/",
    medium: "https://balavenkatesh.medium.com/",
  },
};

export const keywords = [
  "Build with Bala", "Bala App Store", "Bala Venkatesh", "AI apps", "learn AI", "interactive AI",
  "3D AI explainer", "AI agents", "RAG", "MCP", "tool calling", "neural networks", "LLM", "open source AI", "AI tools",
];

export function whatsappLink(text = site.whatsappText) {
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export const categories = [
  { id: "learn-3d", label: "Learn AI in 3D", blurb: "Agents, RAG, neural nets", color: "#D81B60", grad: "linear-gradient(135deg,#D81B60,#7C3AED)" },
  { id: "tools", label: "AI tools", blurb: "Models, RAG, data", color: "#099268", grad: "linear-gradient(135deg,#099268,#0284C7)" },
  { id: "agents-rag", label: "Agents & RAG", blurb: "Patterns you can run", color: "#7C3AED", grad: "linear-gradient(135deg,#7C3AED,#0284C7)" },
  { id: "data-ml", label: "Data & ML", blurb: "End-to-end projects", color: "#0284C7", grad: "linear-gradient(135deg,#0284C7,#12B886)" },
  { id: "collections", label: "Collections", blurb: "Curated models & guides", color: "#0D9488", grad: "linear-gradient(135deg,#0D9488,#7C3AED)" },
  { id: "games", label: "Games", blurb: "Built for fun", color: "#D97706", grad: "linear-gradient(135deg,#D97706,#D81B60)" },
  { id: "lab", label: "Lab", blurb: "Early experiments", color: "#5F6878", grad: "linear-gradient(135deg,#5F6878,#7C3AED)" },
] as const;

export type CategoryId = (typeof categories)[number]["id"];
export const categoryById = (id: string) => categories.find((c) => c.id === id) ?? categories[0];

export const statusLabel: Record<string, string> = {
  live: "Live",
  "open-source": "Open source",
  coming: "Coming live",
  lab: "Lab",
};

export const statusCta: Record<string, string> = {
  live: "Try it live",
  "open-source": "View the code",
  coming: "Join waitlist",
  lab: "See experiment",
};
