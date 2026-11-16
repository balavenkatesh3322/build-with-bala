// Daily content rotates by calendar day (UTC), so every visit on a new day shows something new.
export type Quiz = { key: string; question: string; options: string[]; answer: number; explain: string; app?: string };
export type Poll = { key: string; question: string; options: string[] };

export const quizzes: Quiz[] = [
  {
    key: "rag-position-bias",
    question: "Your RAG pipeline retrieved the right document, but it's last in the context and the answer is still wrong. What's the most likely root cause?",
    options: ["The embedding model is too small", "Context position bias", "Chunks are too large", "Temperature is too high"],
    answer: 1,
    explain: "Models give less weight to documents in the context's \"danger zone\". A reranker that pushes the best document to the top usually fixes it. RAG Doctor detects this automatically.",
    app: "rag-doctor",
  },
  {
    key: "who-runs-tools",
    question: "In LLM tool calling, who actually executes the tool?",
    options: ["The LLM itself", "Your application code", "The vector database", "The tokenizer"],
    answer: 1,
    explain: "The model only asks for a tool and its arguments. Your code runs it and sends the result back. AgentDecode 3D shows this round trip step by step.",
    app: "agentdecode-3d",
  },
  {
    key: "attention-k",
    question: "In attention, softmax(QKᵀ/√d)·V. What does K stand for?",
    options: ["Kernel", "Keys", "Knowledge", "K-nearest neighbours"],
    answer: 1,
    explain: "Queries are compared against Keys to decide how much of each Value to mix in. Tap the attention layer in NeuralDecode 3D to see it.",
    app: "neuraldecode-3d",
  },
  {
    key: "attention-sqrt-d",
    question: "Why does scaled dot-product attention divide by √d?",
    options: ["To stop large dot products saturating the softmax", "To reduce GPU memory", "To normalise embeddings to unit length", "To speed up tokenisation"],
    answer: 0,
    explain: "Dot products grow with dimension. Scaling keeps the softmax out of regions where gradients vanish.",
    app: "neuraldecode-3d",
  },
  {
    key: "vram-7b",
    question: "Roughly how much memory do a 7B-parameter model's weights need in 16-bit precision?",
    options: ["3.5 GB", "7 GB", "14 GB", "28 GB"],
    answer: 2,
    explain: "7 billion parameters × 2 bytes ≈ 14 GB, before activations and KV cache. Open LLM Registry's VRAM wizard does this maths for you.",
    app: "open-llm-registry",
  },
  {
    key: "mcp",
    question: "What does MCP (Model Context Protocol) standardise?",
    options: ["How models are trained", "How AI apps connect to tools and data", "GPU memory allocation", "Prompt compression"],
    answer: 1,
    explain: "MCP is a common way for AI apps to plug into tools and data sources, so every integration isn't custom. AgentDecode 3D has an MCP module.",
    app: "agentdecode-3d",
  },
  {
    key: "tiny-chunks",
    question: "In RAG, what usually goes wrong when chunks are too small?",
    options: ["Facts get split across chunks and lose context", "GPUs slow down", "Temperature rises", "The tokenizer fails"],
    answer: 0,
    explain: "Chunk fragmentation is one of the most common silent RAG failures. Overlap and semantic chunking help.",
    app: "rag-doctor",
  },
];

export const polls: Poll[] = [
  { key: "blocker", question: "What's your biggest blocker using AI at work?", options: ["Hallucinations & accuracy", "Data privacy & security", "Not sure where to start", "Cost of running models", "Getting team buy-in"] },
  { key: "next-3d", question: "What should be explained in 3D next?", options: ["Diffusion models", "Fine-tuning", "Vector databases", "Reinforcement learning"] },
  { key: "learn-style", question: "How do you learn AI best?", options: ["Short videos & reels", "Docs & blogs", "Building projects", "Structured courses"] },
  { key: "run-llms", question: "How do you run LLMs today?", options: ["Cloud APIs", "Locally on my machine", "Both", "Not yet"] },
];

export function dayIndex(d = new Date()) {
  return Math.floor(d.getTime() / 86_400_000);
}
export function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}
export function todaysQuiz(d = new Date()) {
  return quizzes[dayIndex(d) % quizzes.length];
}
export function todaysPoll(d = new Date()) {
  return polls[dayIndex(d) % polls.length];
}
/** Storage keys include the date so the same quiz/poll can repeat on a later day with fresh votes. */
export const quizStoreKey = (q: Quiz, d = new Date()) => `${dayKey(d)}:${q.key}`;
export const pollStoreKey = (p: Poll, d = new Date()) => `${dayKey(d)}:${p.key}`;

/** Concept-of-the-day rotates through the 3D explainers. */
export const concepts = [
  { slug: "agentdecode-3d", title: "Tool calling, explained in 3D", blurb: "Watch the model ask for a tool, get JSON back, and answer." },
  { slug: "neuraldecode-3d", title: "Attention, one layer at a time", blurb: "Tap a layer and see the real math behind it." },
  { slug: "3d-agent-lab", title: "How agent teams hand off work", blurb: "Assemble a team and watch a mission run." },
];
export const todaysConcept = (d = new Date()) => concepts[dayIndex(d) % concepts.length];
