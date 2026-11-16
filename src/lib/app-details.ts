// Per-app screenshots and the short write-up shown on each app page.
// "why" is written in Bala's voice. Edit freely; it's plain content.
export type Shot = { src: string; caption: string };
export type AppStory = {
  shots: Shot[];
  howToUse: string[];
  built: string;
  business: string;
  realLife: string;
  why: string;
};

const s = (slug: string, n: number, caps: string[]): Shot[] => caps.slice(0, n).map((caption, i) => ({ src: `/media/shots/${slug}-${i + 1}.jpg`, caption }));
const rd = (repo: string, caps: [string, string] = ["README overview", "Usage and details"]): Shot[] => caps.map((caption, i) => ({ src: `/media/shots/rd-${repo}-${i + 1}.jpg`, caption }));

export const appDetails: Record<string, AppStory> = {
  "agentdecode-3d": {
    shots: s("agentdecode", 4, ["Tap any part of the agent to see what it does", "A real tool-calling run, step by step", "Every message and tool call, live", "RAG, tool calling and MCP modules"]),
    howToUse: ["Open the app and pick a module: RAG, tool calling or MCP.", "Press play and watch the agent run, one message at a time.", "Tap the LLM, a tool or the retriever to read what it's doing in plain words."],
    built: "A React and Three.js scene that replays a real agent trace. Each step (prompt, tool request, tool result, answer) is a node in 3D space, and the camera moves between them as the run plays.",
    business: "Teams adopting agents lose weeks to confusion about what the model does and what the code does. A shared visual makes onboarding faster and design reviews clearer, because everyone sees the same loop.",
    realLife: "A product manager about to approve an \"AI assistant\" feature can watch exactly where the model calls a tool and where your code takes over, then ask the right questions about cost and risk.",
    why: "I kept explaining tool calling with arrows on a whiteboard, and people still couldn't picture it. I wanted something you could watch and touch instead of read.",
  },
  "neuraldecode-3d": {
    shots: s("neuraldecode", 4, ["Tap any layer to see its real math", "Attention, one layer at a time", "Tensor shapes flowing through the network", "Every step explained in plain words"]),
    howToUse: ["Open the visualiser and choose an architecture.", "Click any layer to open its formula, shapes and a plain-words explanation.", "Step forward to watch data flow through the network."],
    built: "An interactive WebGL inspection engine in TypeScript and Three.js. Layers are 3D blocks wired by the real tensor shapes, and each block opens a panel with the maths behind it.",
    business: "Building intuition for neural networks is slow and expensive. Visual, hands-on learning shortens ramp-up for engineers moving into AI and helps non-specialists follow technical discussions.",
    realLife: "A backend engineer joining an ML team can explore attention in 3D on day one, instead of spending a week decoding papers before the first design meeting.",
    why: "Papers hide the intuition and diagrams hide the maths. I wanted both in one place, where curiosity is rewarded with a click.",
  },
  "3d-agent-lab": {
    shots: s("agentlab", 4, ["Assemble your agent team", "Agents plan and hand off work", "A mission running in the 3D control room", "Results from each agent"]),
    howToUse: ["Pick the agents you want on your team.", "Give the team a mission.", "Watch each agent plan, use tools and hand off work in the 3D control room."],
    built: "React Three Fiber renders the control room, and LLM-driven agents coordinate through a shared plan. Each hand-off and tool call is animated so the flow of work is visible.",
    business: "Multi-agent systems promise automation, but the design choices (who does what, when to hand off) are hard to reason about. Simulating a team first saves expensive trial and error later.",
    realLife: "Before automating a research-and-report workflow, a team can model it as agents here and see where hand-offs break down.",
    why: "\"Multi-agent\" sounded like magic to most people I talked to. Building one you can watch makes it concrete, and it's fun.",
  },
  "throne-chess-3d": {
    shots: s("chess", 4, ["Life-size medieval armies on the board", "Crowned kings and queens", "Every capture becomes a battle", "The slow-motion kill cam"]),
    howToUse: ["Open the game in your browser.", "Play your move like normal chess.", "Capture a piece and enjoy the cinematic battle."],
    built: "A Three.js game with animated 3D pieces, a cinematic camera system and a slow-motion kill cam, running entirely in the browser.",
    business: "It shows what real-time 3D on the web can do: rich, memorable experiences with no install. The same techniques power product configurators and interactive demos.",
    realLife: "A brand wanting a playful launch microsite could use the same approach: a game people share because it's fun, delivered as a simple link.",
    why: "I wanted to push 3D in the browser for fun, and chess was the perfect stage: everyone knows the rules, so all the attention goes to the experience.",
  },
  "learn-ai-papers": {
    shots: rd("learn-ai-papers"),
    howToUse: ["Open the repository and pick a paper.", "Read the colour-coded highlights first.", "Use the key takeaways to revise or explain it to others."],
    built: "Annotated PDFs and markdown notes with a consistent colour code, so every paper reads the same way: key ideas, methods and results are always marked alike.",
    business: "Teams need to keep up with research without losing whole days to it. Shared, annotated summaries cut reading time and keep everyone on the same page.",
    realLife: "Before a design review that leans on a new technique, a team can read the colour-coded version in ten minutes instead of the full paper.",
    why: "I annotate papers for myself anyway. Making the system consistent and public means others can learn faster too.",
  },
  "open-llm-registry": {
    shots: s("llm", 3, ["Directory of open-weight models", "Benchmarks and licence details", "VRAM sizing and hardware fit"]),
    howToUse: ["Search or filter models by licence, size and benchmarks.", "Open a model to compare its details.", "Use the VRAM wizard to check it fits your GPU before you download anything."],
    built: "A local-first, static TypeScript app driven entirely by markdown, so contributors add or update models with a simple pull request.",
    business: "Picking the wrong model, or buying the wrong hardware for it, is costly. Comparing licence, quality and memory needs up front avoids both.",
    realLife: "A startup planning to self-host an LLM can confirm in minutes which open models fit its GPUs and allow commercial use.",
    why: "I was answering \"which open model should we use?\" over and over. A searchable registry with a VRAM check answers it once, for everyone.",
  },
  "rag-doctor": {
    shots: rd("rag-doctor", ["Install and diagnose in a few lines", "Root cause, severity and fix"]),
    howToUse: ["Install it with pip install rag-doctor.", "Pass your query, the answer, the retrieved documents and the expected answer.", "Read the root cause, its severity and a suggested configuration fix."],
    built: "A Python library with a set of diagnostic checks for common RAG failures (chunk fragmentation, retrieval misses, context position bias) that returns a structured report.",
    business: "RAG systems fail silently and teams burn time guessing. A root cause in seconds turns debugging into a checklist and protects trust in AI answers.",
    realLife: "A support bot keeps citing the wrong policy. RAG Doctor shows the right document was retrieved but buried, and suggests turning on a reranker.",
    why: "Every RAG project I saw debugged by trial and error. I wanted the diagnosis to be as quick as running a test.",
  },
  "ai-career-copilot": {
    shots: [{ src: "/media/shots/career-1.jpg", caption: "AI Career Copilot" }],
    howToUse: ["Upload your resume once.", "Point it at the roles you're interested in.", "Get a fit score, company research and tailored application materials for each role."],
    built: "An offline-first tool with both a CLI and a web UI. It parses your resume, scores fit against job descriptions with LLM reasoning, and drafts tailored materials.",
    business: "Job seekers and career coaches save hours per application, and better-targeted applications lead to more replies.",
    realLife: "A graduate applying to twenty roles gets a ranked shortlist and tailored drafts in an evening instead of losing every weekend.",
    why: "Watching friends send the same generic resume everywhere, and hear nothing back, convinced me the search itself needed better tools.",
  },
  "sql-copilot": {
    shots: rd("sql-copilot"),
    howToUse: ["Connect a database.", "Ask a question in plain English.", "Get the SQL, the result and a chart."],
    built: "A TypeScript app that turns natural-language questions into SQL against your database and returns the results with charts.",
    business: "Simple data questions stop becoming tickets. Analysts spend time on real analysis, and everyone else gets answers the same day.",
    realLife: "A product manager asks \"How many users signed up last week by country?\" and gets a chart in seconds.",
    why: "I've seen too many small questions wait days in a queue. Plain English should be enough to ask your own data.",
  },
  "devbrand-studio": {
    shots: rd("BrandStudio"),
    howToUse: ["Connect your GitHub and other profiles.", "Let it gather your activity and projects.", "Generate bios and posts that show your real impact."],
    built: "A TypeScript and React platform that aggregates a developer's work and uses an LLM to write bios and content in different styles.",
    business: "Developers with a clear personal brand get more opportunities. Turning existing activity into a story takes minutes instead of weeks.",
    realLife: "An open-source maintainer gets a polished profile and a launch post for their latest release, drafted from their own commits.",
    why: "Great engineers often undersell their work. I wanted their GitHub to speak for them.",
  },
  "free-ai-certification": {
    shots: s("cert", 3, ["Free AI certificates in one place", "The learning landscape at a glance", "Filter by domain and provider"]),
    howToUse: ["Browse the dashboard to see what's available.", "Filter by domain, such as GenAI, ML or LLM security.", "Pick a certificate and follow the link to start for free."],
    built: "An interactive single-page directory with charts and filters, maintained by the community.",
    business: "Companies can upskill teams on AI without a training budget, using verifiable, free credentials.",
    realLife: "A career switcher builds a free learning path from fundamentals to GenAI, with certificates to show along the way.",
    why: "Cost shouldn't decide who gets to learn AI. Free, credible options exist; they were just scattered.",
  },
  "awesome-developer-portfolio": {
    shots: s("port", 3, ["2,000+ developer portfolios", "Curated and searchable", "Find ideas fast"]),
    howToUse: ["Search or browse the gallery.", "Open portfolios for layout and content ideas.", "Submit your own to be featured."],
    built: "A curated, searchable TypeScript gallery of developer portfolios with previews.",
    business: "A strong portfolio helps people get noticed. Good examples shorten the time to a great one.",
    realLife: "A student building a first portfolio finds three layouts they love in five minutes, then ships theirs the same weekend.",
    why: "Starting a portfolio from a blank page is the hardest part. Seeing what works makes it easy to begin.",
  },
  "datapilot": {
    shots: s("dp", 3, ["Architecture", "The agent loop: think, act, observe", "Demo workflow with human approval"]),
    howToUse: ["Clone the repo and run the demo.", "Give DataPilot a business goal.", "Watch it pick tools, run them, and pause for your approval before risky actions."],
    built: "A Python teaching project: the LLM chooses a tool and its inputs, Python validates and runs it, and the result goes back to the model. Consequential actions wait for human approval.",
    business: "Agents in production need guardrails. This shows the exact pattern (validated tools plus human approval) that keeps automation safe.",
    realLife: "An ops team prototyping an agent that sends customer emails can see why the send step should always wait for a person.",
    why: "Frameworks hide the agent loop. I wanted a small, readable example where nothing is magic.",
  },
  "document-rag": {
    shots: rd("Document-RAG"),
    howToUse: ["Upload your documents to the knowledge base.", "Ask questions in natural language.", "Check the cited sources and explore trends in the visualisations."],
    built: "A RAG engine for question answering over your files, paired with a data-visualisation suite, designed with security and scale in mind.",
    business: "Teams that live in PDFs and reports find facts in seconds and spot trends without manual reading, which matters most in legal and compliance work.",
    realLife: "An investigator searching thousands of case files asks a question and gets an answer with the exact source passages.",
    why: "Too much important knowledge is locked in documents nobody has time to read. RAG should make it answerable, with proof.",
  },
  "technical-knowledge-assistant": {
    shots: s("tka", 3, ["Architecture", "API sequence", "Proposal overview"]),
    howToUse: ["Index your engineering and architecture docs.", "Ask questions through the API.", "Get grounded answers with sources."],
    built: "An async Python microservice combining semantic search with an LLM, built for scale, durability and observability.",
    business: "Engineers waste hours hunting through design docs. A trustworthy assistant gives that time back and spreads knowledge across the team.",
    realLife: "A new engineer asks how the payment service handles retries and gets the answer from the right design doc, with a link.",
    why: "Architecture docs are written once and rarely found again. I wanted them to answer questions.",
  },
  "llm-guardrails": {
    shots: rd("guardrails-demo"),
    howToUse: ["Run the Streamlit app locally.", "Try prompts and responses against Llama Guard.", "Compare results with and without guardrails."],
    built: "Ready-to-run Streamlit apps using Llama Guard, alone or with Llama 2, plus a NeMo Guardrails setup.",
    business: "Unsafe outputs damage trust and create risk. Testing guardrails before launch is far cheaper than fixing incidents after.",
    realLife: "Before launching a customer chatbot, a team tests jailbreak attempts and confirms which ones the guardrail blocks.",
    why: "Most teams never test for misuse. I wanted a quick way to see the risks, and the defences, hands-on.",
  },
  "adaxon-recommender": {
    shots: rd("recommendation_engine"),
    howToUse: ["Run the containerised service.", "Feed it interaction data such as clicks and installs.", "Request recommendations for known and brand-new users."],
    built: "A hybrid recommender: weighted matrix factorisation (ALS) for users with history, plus country and platform segments to handle new users. Packaged with Docker.",
    business: "New users who get relevant recommendations engage sooner, which improves early conversion and retention.",
    realLife: "An app store shows a first-time visitor in India on Android a relevant set of apps on day zero, instead of a generic top-ten list.",
    why: "The cold-start problem is where most recommenders quietly fail. I wanted a clear, production-style answer to it.",
  },
  "ai-experiment-hub": {
    shots: rd("AIExperimentHub"),
    howToUse: ["Browse the list of experiments.", "Open one that matches your problem.", "Run it and adapt it to your data."],
    built: "A collection of projects built with LangChain, Gemini and open-source models: threat modelling from diagrams, DevOps misconfiguration detection, crop-disease detection and number-plate reading.",
    business: "Each experiment is a ready starting point for a practical AI use case, which cuts the time from idea to prototype.",
    realLife: "A DevOps team uses the configuration checker as a first pass on pipeline files before human review.",
    why: "AI is more than chatbots. I use this hub to try practical ideas quickly and share what works.",
  },
  "loan-default-prediction": {
    shots: s("loan", 2, ["ROC curve", "Conclusions"]),
    howToUse: ["Explore the EDA notebook.", "Train the gradient-boosting model.", "Review performance and the proposed deployment design."],
    built: "An end-to-end Python project: exploratory analysis, feature engineering, a gradient-boosting model and a proposed MLOps architecture.",
    business: "Better default prediction means fewer bad loans and fairer approvals for good borrowers. Both protect revenue.",
    realLife: "A lender uses a model like this to flag risky applications for manual review instead of rejecting them outright.",
    why: "Tabular risk models are everywhere in business. I wanted a clean, complete template from data to deployment.",
  },
  "ecommerce-logistics-analytics": {
    shots: s("eco", 3, ["Logistics dashboard home", "Delay prediction page", "Live prediction for new orders"]),
    howToUse: ["Load the dataset.", "Explore delivery performance in the dashboard.", "Predict whether a new order will arrive late."],
    built: "An interactive Streamlit app on a real e-commerce dataset, with exploratory analysis, model training and a delay predictor.",
    business: "Spotting late deliveries early lets teams act before customers complain, which protects reviews and repeat purchases.",
    realLife: "An ops manager sees which routes run late this week and warns customers before the delay becomes a complaint.",
    why: "Logistics data tells you about problems after they happen. I wanted it to warn you before.",
  },
  "face-unlock": {
    shots: [{ src: "/media/shots/face-1.jpg", caption: "Face unlock demo" }],
    howToUse: ["Capture your face to build a small dataset.", "Train the recogniser.", "Let it lock Ubuntu when you leave and unlock when you return."],
    built: "Python and OpenCV with the face-recognition library, plus a few scripts that control the Ubuntu screensaver.",
    business: "It's a simple, practical look at on-device face recognition, the same building block behind secure, hands-free access.",
    realLife: "Step away from your desk and the screen locks itself; sit back down and it opens.",
    why: "I kept forgetting to lock my laptop. Solving that with computer vision was the most fun way to learn it.",
  },
  "tfjs-face-motion": {
    shots: [{ src: "/media/shots/tfjs-1.jpg", caption: "Video that follows your head" }],
    howToUse: ["Open the HTML file in your browser.", "Allow camera access.", "Move your head and watch the video follow."],
    built: "TensorFlow.js with the BlazeFace model tracks your face in the browser and moves the video frame to match, all in one HTML file.",
    business: "It shows how little it takes to add computer vision to a web page, with no servers and no installs, and privacy by default.",
    realLife: "The same idea powers hands-free controls and accessibility features in browser apps.",
    why: "I saw the effect in a conference talk and wanted to prove you could build it in a few lines.",
  },
};
