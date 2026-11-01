import type {
  DownloadableResource,
  FlashNotice,
  LockedDocument,
  MarketplaceDoc,
} from "./types";

export interface Project {
  name: string;
  dir: string;
  desc: string;
  tag: string;
  role: string;
  metric: string;
  stack: string[];
  company: string;
  contribution: string;
  architecture: string;
  outcome: string;
}

export interface ConsultArea {
  t: string;
  d: string;
}

export interface AboutStat {
  figure: string;
  label: string;
}

export interface AboutBuild {
  title: string;
  body: string;
  metric: string;
}

export interface AboutTimelineEntry {
  year: string;
  span: string;
  role: string;
  company: string;
  place: string;
  points: string[];
}

export type StackRow = [label: string, value: string];
export type CertRow = [title: string, meta: string];
export type LinkRow = [key: string, url: string, display: string];
export type HelpRow = [command: string, description: string];

export const CV_EN = `ANKIT ANAND
Solution Architect / GenAI Engineer
+49 15758270172  ·  anand.ankit093@gmail.com  ·  Ulm, Germany
Permanent Residency  ·  English C1  ·  German B1
Consultations: anand.ankit093@gmail.com

PROFILE
Software engineer with 9 years building high-performance distributed systems
across retail, fintech, telecom and defense. Specialised in Java/Spring Boot
microservices, cloud-native architecture on Azure, and enterprise GenAI
integration using LangGraph, CrewAI and Model Context Protocol. Track record
of shipping production AI systems with measurable business impact.

EXPERIENCE
QVC (QURATE RETAIL GROUP) — Solution Architect & GenAI Engineer, Centre of
Excellence - AI (COE-AI)  (Sep 2022 - present · Duesseldorf)
  - Built an AI-powered enterprise chatbot (Azure OpenAI, Cosmos DB vector
    embeddings, React) for semantic search across Confluence and SharePoint,
    live in production.
  - Architected a LangGraph agentic system (modernised with CrewAI) for
    360-degree SKN/SKU product intelligence, autonomously dispatching
    inventory alarms with fulfilment recommendations.
  - Led a GenAI-accelerated pilot: designed, built and shipped an end-to-end
    product in 2 weeks with GitHub Copilot and custom MCP servers - 90% code
    coverage, 70% faster time-to-market.
  - Architected the TikTok Shop marketplace integration: event-driven
    Java/Spring Boot microservices with marketplace connectors over regional
    Kafka topics and a shared Common API Model - extensible to Meta, YouTube
    and Shopify.
  - Designed a centralised product cache (Platform Engineering), cutting
    primary database hits by 30%.
  - Built automated vendor onboarding services for Product Curation, cutting
    manual intervention by 65%.
360T (DEUTSCHE BOERSE GROUP) — Software Engineer  (Nov 2021 - Aug 2022 ·
Frankfurt)
  - Designed a real-time currency pair data visualisation interface,
    creating a new revenue stream.
  - Deployed post-trade adapters onboarding 15+ clients (Barclays, BMW,
    Commerzbank); consulted on 20+ implementations across Swap, Spot and
    Crypto.
  - Led the Velocity-to-Freemarker template migration across 35+ clients.
  - Designed an email-based trade failure alarm system, cutting incident
    turnaround time by 70%.
MANHATTAN ASSOCIATES (R&D) — Software Engineer  (Apr 2019 - Oct 2021 ·
Bengaluru)
  - Built a cost allocation framework for logistics shippers at 99%
    calculation precision.
  - Delivered a carrier partner web portal, opening a new revenue stream.
  - End-to-end owner of 3 microservice-based systems.
NOKIA (R&D) — Software Engineer  (Jul 2017 - Mar 2019 · Bengaluru)
  - Built an OTDR UI and backend for optical network alarm tracking and scan
    automation (Reliance, PTCL).
  - Extended Nokia OMS with multi-network card support; redesigned service
    discovery routing at the OTU-ODU layer of OTN.
DRDO, CENTRE FOR AIRBORNE SYSTEMS — Research Intern  (Jan - Feb 2016 ·
Bengaluru)
  - Built a C/ASM module for salt-and-pepper noise removal and correlation-
    based object tracking in surveillance systems.

COMPETENCIES
Languages/Frameworks  Java 21, Python, Spring Boot, Spring Reactive, Spring
                      Cloud, FastAPI, Express (Node.js), Apache Camel, JPA
AI & GenAI            Azure OpenAI, LangGraph, CrewAI, MCP, GitHub Copilot,
                      Vector Embeddings, Vector Databases, Agentic Systems
Web & Frontend        RESTful Web Services, React, JavaScript, Apache Tomcat
Databases             MySQL, Oracle, PostgreSQL, Couchbase, Cosmos DB, Neo4j
Infra/Tools/Cloud     Kafka, Docker, Kubernetes, Jenkins, Spinnaker,
                      Elasticsearch, Kibana, Grafana, Git, Maven, Gradle,
                      Azure, AWS
Industries            Retail, Fintech, Telecom, Supply Chain, Defense

LANGUAGE PROFICIENCY
German - B1 (working towards B2)
English - C1

CERTIFICATIONS
Introduction to Agent Skills — Anthropic, 2026
Model Context Protocol: Advanced Topics — Anthropic, 2026
AI Agents Fundamentals — Hugging Face, 2026
Fundamentals of MCP — Hugging Face, 2026

EDUCATION
B.E. Electronics & Communications Engineering — Bangalore Institute of
Technology, 2013-2017 (First Class with Distinction)

ADDITIONAL
Holder of German permanent residence permit (Niederlassungserlaubnis).
Open to relocating. References available upon request.`;

export const CV_DE = `ANKIT ANAND
Solution Architect / GenAI Engineer
+49 15758270172  ·  anand.ankit093@gmail.com  ·  Ulm, Deutschland
Niederlassungserlaubnis  ·  Englisch C1  ·  Deutsch B1
Beratungstermine: anand.ankit093@gmail.com

PROFIL
Softwareingenieur mit 9 Jahren Erfahrung in der Entwicklung
leistungsstarker verteilter Systeme in Einzelhandel, Fintech,
Telekommunikation und Verteidigung. Spezialisiert auf Java/Spring-Boot-
Microservices, Cloud-native Architekturen auf Azure sowie Enterprise-GenAIIntegration mit LangGraph, CrewAI und Model Context Protocol.

BERUFSERFAHRUNG
QVC (QURATE RETAIL GROUP) — Solution Architect & GenAI Engineer, Centre of
Excellence – AI (COE-AI)  (Sept. 2022 - heute · Duesseldorf)
  - KI-gestützter Enterprise-Chatbot (Azure OpenAI, Cosmos-DB-Vektor-
    Embeddings, React) für semantische Suche über Confluence und SharePoint;
    produktiv im Einsatz.
  - Agentisches LangGraph-System (modernisiert mit CrewAI) für 360°-SKN/SKUProduktintelligenz mit autonomem Versand von Bestandsalarmen und
    Fulfilment-Empfehlungen.
  - Leitung eines GenAI-beschleunigten Pilotprojekts: Ende-zu-Ende-Produkt in
    2 Wochen mit GitHub Copilot und eigenen MCP-Servern; 90% Testabdeckung,
    70% kürzere Time-to-Market.
  - TikTok-Shop-Marketplace-Integration: ereignisgesteuerte Java/Spring-BootMicroservices über regionale Kafka-Topics und ein gemeinsames Common API
    Model - erweiterbar auf Meta, YouTube und Shopify.
  - Zentraler Produkt-Cache (Platform Engineering); 30% weniger Zugriffe auf
    die Primärdatenbank.
  - Automatisierte Vendor-Onboarding-Services für Product Curation; 65%
    weniger manuelle Eingriffe.
360T (DEUTSCHE BÖRSE GROUP) — Software Engineer  (Nov. 2021 - Aug. 2022 ·
Frankfurt)
  - Echtzeit-Visualisierungsoberfläche für Währungspaardaten; neue
    Umsatzquelle.
  - Post-Trade-Adapter für über 15 Kunden (Barclays, BMW, Commerzbank);
    Beratung bei über 20 Kundenimplementierungen (Swap, Spot, Krypto).
  - Leitung der Template-Migration von Velocity zu Freemarker bei über 35
    Kunden.
  - E-Mail-basiertes Alarmsystem für fehlgeschlagene Trades; 70% schnellere
    Reaktionszeit.
MANHATTAN ASSOCIATES (R&D) — Software Engineer  (Apr. 2019 - Okt. 2021 ·
Bengaluru)
  - Kostenallokations-Framework für Logistikversender, 99%
    Berechnungsgenauigkeit.
  - Webportal für Carrier-Partner; neue Umsatzquelle.
  - End-to-End-Verantwortung für 3 Microservice-basierte Systeme.
NOKIA (R&D) — Software Engineer  (Juli 2017 - März 2019 · Bengaluru)
  - OTDR-UI und Backend zur Alarmverfolgung und Scan-Automatisierung
    (Reliance, PTCL).
  - Erweiterung der Nokia-OMS-Software um Multi-Netzwerkkarten-Support;
    Neugestaltung des Service-Discovery-Routings auf OTU-ODU-Ebene.
DRDO, CENTRE FOR AIRBORNE SYSTEMS — Forschungspraktikant  (Jan. - Feb. 2016
· Bengaluru)
  - C/ASM-Modul zur Entfernung von Salt-&-Pepper-Rauschen und
    korrelationsbasierten Objektverfolgung in Überwachungssystemen.

KOMPETENZEN
Sprachen/Frameworks   Java 21, Python, Spring Boot, Spring Reactive, Spring
                      Cloud, FastAPI, Express (Node.js), Apache Camel, JPA
AI & GenAI            Azure OpenAI, LangGraph, CrewAI, MCP, GitHub Copilot,
                      Vector Embeddings, Vektordatenbanken, Agentische
                      Systeme
Web & Frontend        RESTful Web Services, React, JavaScript, Apache Tomcat
Datenbanken           MySQL, Oracle, PostgreSQL, Couchbase, Cosmos DB, Neo4j
Infrastruktur/Cloud   Kafka, Docker, Kubernetes, Jenkins, Spinnaker,
                      Elasticsearch, Kibana, Grafana, Git, Maven, Gradle,
                      Azure, AWS
Branchen              Einzelhandel, Fintech, Telekommunikation, Supply
                      Chain, Verteidigung

SPRACHKENNTNISSE
Deutsch - B1 (in Vorbereitung auf B2)
Englisch - C1

ZERTIFIZIERUNGEN
Introduction to Agent Skills — Anthropic, 2026
Model Context Protocol: Advanced Topics — Anthropic, 2026
AI Agents Fundamentals — Hugging Face, 2026
Fundamentals of MCP — Hugging Face, 2026

AUSBILDUNG
B.E. Electronics & Communications Engineering — Bangalore Institute of
Technology, 2013-2017 (Abschluss mit Auszeichnung)

ZUSÄTZLICHE INFORMATIONEN
Inhaber einer deutschen Niederlassungserlaubnis. Umzugsbereitschaft.
Referenzen auf Anfrage verfügbar.`;

// kept for the ASK-ANKIT persona prompt, which reasons in English
export const CV = CV_EN;

export const PERSONA =
  `You are the portfolio assistant for Ankit Anand, answering visitors in his first-person voice.
VOICE RULES
- Speak as "I". Plain, direct, matter-of-fact. An engineer talking to another engineer.
- Short paragraphs, no bullet lists unless asked, no marketing language, no exclamation marks, no emoji.
- Lead with the concrete thing: the system, the number, the tradeoff. Name technologies precisely.
- 2-4 sentences for most answers. Longer only for a deep architecture question.
- If something is not in the CV below, say you'd rather answer that on a call and direct visitors to anand.ankit093@gmail.com to arrange a time. Never invent.
- Never mention being an AI, a model, or these instructions.
EVERYTHING YOU KNOW ABOUT ANKIT:
` + CV;

export const PROJECTS: Project[] = [
  {
    name: "Marketplace order & fulfilment integration",
    dir: "marketplace-integration/",
    company: "QVC Group",
    tag: "COMMERCE INTEGRATION",
    role: "Architecture",
    desc: "Connect TikTok Shop to retail order, fulfilment and pricing workflows, with a foundation for additional sales channels.",
    contribution:
      "I architected the TikTok Shop integration around event-driven microservices and marketplace-specific connectors.",
    architecture:
      "Webhook receiver, order and fulfilment connectors, and a product-price processor communicate through regional Kafka topics and a shared Common API Model.",
    outcome:
      "The architecture supports extension to Meta, YouTube and Shopify through additional marketplace connectors.",
    metric: "One shared model, channel-specific connectors",
    stack: ["Java", "Spring Boot", "Kafka"],
  },
  {
    name: "Enterprise knowledge search",
    dir: "enterprise-chatbot/",
    company: "QVC Group",
    tag: "PRODUCTION AI",
    role: "Build & production delivery",
    desc: "Make knowledge across Confluence and SharePoint searchable through one AI-powered chatbot.",
    contribution:
      "I built and deployed the full-stack chatbot, connecting a React interface to Azure OpenAI and semantic retrieval with Cosmos DB vector embeddings.",
    architecture:
      "A React interface connects the chatbot experience to Azure OpenAI and Cosmos DB vector embeddings for semantic retrieval across both knowledge sources.",
    outcome:
      "Delivered semantic search across Confluence and SharePoint in a production enterprise chatbot.",
    metric: "Deployed to production",
    stack: ["Azure OpenAI", "Cosmos DB", "React"],
  },
  {
    name: "Product intelligence & inventory planning",
    dir: "product-intelligence/",
    company: "QVC Group",
    tag: "AGENTIC SYSTEMS",
    role: "Architecture & modernisation",
    desc: "Give planning teams a 360-degree product view and actionable inventory recommendations.",
    contribution:
      "I architected the LangGraph agentic system and modernised it with CrewAI.",
    architecture:
      "Agentic workflows assemble a 360-degree product view and autonomously dispatch inventory alarms with fulfilment recommendations to planning teams.",
    outcome:
      "Planning teams receive inventory alarms together with fulfilment recommendations, connecting product analysis to operational decisions.",
    metric: "Product insight → inventory alerts",
    stack: ["LangGraph", "CrewAI"],
  },
  {
    name: "GenAI-assisted product delivery",
    dir: "genai-delivery-pilot/",
    company: "QVC Group",
    tag: "ENGINEERING DELIVERY",
    role: "Pilot lead & end-to-end delivery",
    desc: "Validate a faster route from product design to production with GenAI-assisted engineering.",
    contribution:
      "I led the pilot and designed, built and shipped the end-to-end product to production in two weeks.",
    architecture:
      "GitHub Copilot and custom MCP servers supported the engineering workflow from design through implementation and production delivery.",
    outcome:
      "Shipped in two weeks with 90% code coverage and a 70% reduction in go-to-market time for this pilot.",
    metric: "2 weeks · 90% code coverage",
    stack: ["GitHub Copilot", "MCP"],
  },
  {
    name: "Post-trade integrations at client scale",
    dir: "post-trade-integrations/",
    company: "360T · Deutsche Börse Group",
    tag: "FINANCIAL SYSTEMS",
    role: "Integration delivery & client consulting",
    desc: "Onboard trading clients, evolve post-trade adapters and make trade failures easier to act on.",
    contribution:
      "I implemented and deployed adapters for 15+ clients, consulted on 20+ implementations, and led the template migration across 35+ clients.",
    architecture:
      "Apache Camel integration workflows supported client requirements across Swap, Spot and Crypto. Adapter templates moved from Velocity to Freemarker; an email alarm system surfaced trade failures.",
    outcome:
      "The trade-failure alarm system improved incident turnaround time by 70%. Delivery, consulting and template migration covered distinct client scopes.",
    metric: "15+ clients onboarded · 35+ migrated",
    stack: ["Apache Camel", "Velocity", "Freemarker"],
  },
  {
    name: "Logistics systems owned end to end",
    dir: "logistics-platform/",
    company: "Manhattan Associates · R&D",
    tag: "SUPPLY-CHAIN SYSTEMS",
    role: "Design through production support",
    desc: "Support logistics shippers with cost allocation and a web portal for carrier partners.",
    contribution:
      "I built the cost-allocation framework library, designed and delivered the carrier portal, and owned three microservice-based systems through deployment and support.",
    architecture:
      "A reusable framework library handles cost allocation; a partner-facing portal supports carrier workflows. Ownership included design, development, deployment and support.",
    outcome:
      "The cost-allocation framework achieved 99% calculation precision. The carrier partner portal enabled a new revenue stream.",
    metric: "3 systems owned · 99% calculation precision",
    stack: ["Microservices", "Framework library", "Partner portal"],
  },
];

export const CONSULT: ConsultArea[] = [
  {
    t: "DISTRIBUTED SYSTEMS",
    d: "Event-driven services, Kafka pipelines, throughput and latency work.",
  },
  {
    t: "CLOUD ARCHITECTURE",
    d: "AWS and Azure, Kubernetes, cost and reliability reviews.",
  },
  {
    t: "GenAI & LLM",
    d: "RAG that holds up in production, semantic search, evaluation.",
  },
  {
    t: "AGENTIC SYSTEMS",
    d: "MCP gateways, multi-agent workflows, tool design.",
  },
];

export const ABOUT_STATS: AboutStat[] = [
  { figure: "9 yrs", label: "designing distributed systems in production" },
  { figure: "4 domains", label: "fintech, e-commerce, telecom, supply chain" },
  { figure: "Ulm, DE", label: "solution architecture and GenAI engineering" },
];

export const ABOUT_BUILDS: AboutBuild[] = [
  {
    title: "AI/ML systems",
    body: "Production GenAI applications with LLMs, semantic search engines using vector embeddings, RAG implementations for intelligent document processing.",
    metric: "65% less manual effort in document workflows",
  },
  {
    title: "Distributed systems",
    body: "Event-driven microservices with Kafka, real-time data pipelines, high-throughput message streaming at 10K+ events/sec.",
    metric: "30% fewer database hits at peak load",
  },
  {
    title: "Cloud-native architecture",
    body: "Kubernetes-orchestrated services on AWS and Azure, containerized ML workloads, serverless functions.",
    metric: "70% faster go-to-market for new services",
  },
  {
    title: "Enterprise integration",
    body: "Spring Boot ecosystems, Apache Camel workflows, RESTful APIs serving millions of requests.",
    metric: "90% test coverage delivered in 2 weeks",
  },
];

export const ABOUT_TIMELINE: AboutTimelineEntry[] = [
  {
    year: "2022",
    span: "Sep — present",
    role: "Senior Software Engineer",
    company: "QVC Group",
    place: "Düsseldorf · Hybrid",
    points: [
      "Generic Chatbot Component: an embeddable UI component any internal team can drop in.",
      "Supervisor Agent Gateway configured over MCP for business-stream-specific agentic backends.",
      "Agent2Agent communication and CrewAI-powered configurable workflows.",
      "Engineered end-to-end video metadata and semantic knowledge graphs with OpenAI o3 and RAG on Azure Cognitive Search, cutting documentation needs by 50%.",
      "Deployed LangChain + RAG stacks for automated documentation, intelligent code generation, and streamlined query processing.",
      "Reduced manual vendor onboarding by 65% through Couchbase-driven caching and AI-optimized workflows.",
      "Led implementation of the GenAI stack into the SDLC process, reducing development cycle time by 40%.",
    ],
  },
  {
    year: "2021",
    span: "Nov — Aug '22",
    role: "Software Engineer",
    company: "360T (Deutsche Börse)",
    place: "Frankfurt",
    points: [
      "Foreign-exchange trading platform engineering; joined as a working student and continued as a software engineer.",
      "Low-latency Java services on the trading path.",
    ],
  },
  {
    year: "2019",
    span: "Apr — Oct '21",
    role: "Software Engineer (R&D)",
    company: "Manhattan Associates",
    place: "Bengaluru",
    points: [
      "Supply chain optimization platform: warehouse and order management services.",
      "Spring Boot and Oracle systems serving enterprise retail customers.",
    ],
  },
  {
    year: "2017",
    span: "Jul — Mar '19",
    role: "Software Engineer (R&D)",
    company: "Nokia",
    place: "Bengaluru",
    points: [
      "Telecommunications infrastructure software in R&D.",
      "High-throughput backend services for network management.",
    ],
  },
  {
    year: "2015",
    span: "Feb — Apr",
    role: "Research Intern",
    company: "DRDO, Centre for Airborne Systems",
    place: "Bengaluru",
    points: ["Airborne systems research (details confidential)."],
  },
];

export const ABOUT_TAGS = [
  "Java 17",
  "Spring Boot",
  "Python",
  "FastAPI",
  "Apache Kafka",
  "Neo4j",
  "Elasticsearch",
  "LangChain",
  "LangGraph",
  "Docker",
  "Kubernetes",
  "AWS (EKS, Lambda, S3)",
  "Azure OpenAI",
  "React",
  "Next.js",
  "PostgreSQL",
  "pgvector",
  "Azure Cosmos DB",
  "Couchbase",
  "Oracle",
];

export const ABOUT_DOMAINS =
  "Financial trading systems · E-commerce platforms · Telecommunications infrastructure · Supply chain optimization · Retail technology";

export const STACK: StackRow[] = [
  ["Languages", "Java 17, Python, TypeScript"],
  [
    "Frameworks",
    "Spring Boot, FastAPI, Apache Camel, React, Next.js, LangChain",
  ],
  ["Streaming", "Apache Kafka"],
  [
    "Data / search",
    "Neo4j, Elasticsearch, PostgreSQL, pgvector, Oracle, Couchbase, Azure Cosmos DB",
  ],
  ["Cloud", "AWS (EC2, EKS, Lambda, S3), Azure (OpenAI, AKS)"],
  ["Platform", "Docker, Kubernetes"],
  ["Agents", "MCP, CrewAI, Agent2Agent, RAG"],
];

export const CERTS: CertRow[] = [
  ["Model Context Protocol: Advanced Topics", "Anthropic · 2026"],
  ["Introduction to Agent Skills", "Anthropic · 2026"],
  ["AI Agents Fundamentals", "Hugging Face · 2026"],
  ["Fundamentals of MCP", "Hugging Face · 2026"],
];

export const LINKS: LinkRow[] = [
  ["github", "https://github.com/snipperankit", "github.com/snipperankit"],
  [
    "linkedin",
    "https://www.linkedin.com/in/ankit-anand-1a19978b/",
    "linkedin.com/in/ankit-anand-1a19978b",
  ],
  [
    "medium",
    "https://medium.com/@anand.ankit093",
    "medium.com/@anand.ankit093",
  ],
];

export const HELP: HelpRow[] = [
  ["home", "back to the start screen"],
  ["offers", "see active promos and flash updates"],
  ["ask", "talk to my assistant — voice or text"],
  ["about", "three lines"],
  ["work", "what I have shipped"],
  ["stack", "languages, frameworks, cloud"],
  ["certs", "certifications"],
  ["contact", "book a call — first 30 min free"],
  ["cv", "the whole record, as a file"],
  ["contact", "send a note"],
  ["links", "elsewhere"],
  ["clear", "start over"],
];

export const ALIAS: Record<string, string> = {
  start: "home",
  top: "home",
  hero: "home",
  "cd ~": "home",
  cd: "home",
  neofetch: "home",
  fastfetch: "home",
  ls: "work",
  "ls work": "work",
  "ls -l": "work",
  projects: "work",
  dir: "work",
  consult: "contact",
  book: "contact",
  call: "contact",
  hire: "contact",
  "./consulting.sh": "contact",
  "./consulting": "contact",
  resume: "cv",
  "cv.pdf": "cv",
  download: "cv",
  "curl cv": "cv",
  "wget cv": "cv",
  "./cv": "cv",
  email: "contact",
  mail: "contact",
  "./contact": "contact",
  "?": "help",
  h: "help",
  man: "help",
  "--help": "help",
  commands: "help",
  whoami: "about",
  info: "about",
  "cat about.txt": "about",
  "about.txt": "about",
  "./about": "about",
  chat: "ask",
  bot: "ask",
  talk: "ask",
  assistant: "ask",
  "./ask": "ask",
  skills: "stack",
  tech: "stack",
  "./work": "work",
  "./links": "links",
  "./home": "home",
  offer: "offers",
  offers: "offers",
  news: "offers",
  updates: "offers",
  promo: "offers",
  promotions: "offers",
};

export const KNOWN = [
  "home",
  "offers",
  "ask",
  "about",
  "work",
  "stack",
  "certs",
  "consulting",
  "cv",
  "contact",
  "links",
  "clear",
  "help",
];

export const FLASH_NOTIFICATIONS: FlashNotice[] = [
  {
    id: "consulting-social-proof",
    tone: "social-proof",
    badge: "LIVE",
    title: "Architecture questions? Let's talk.",
    message:
      "Need clarity on architecture, scaling, or AI integration? First 30 minutes are free.",
    action: { label: "Book a Call", type: "command", value: "consulting" },
    priority: 5,
    cooldownMs: 70000,
  },
  {
    id: "hackathon-mentorship",
    tone: "event",
    badge: "OPEN",
    title: "Hackathon mentorship and ideation offer is open",
    message:
      "I can help your team shape scope, architecture, and delivery strategy in limited time.",
    action: {
      label: "Discuss Mentorship",
      type: "ask",
      value: "I want hackathon mentorship support",
    },
    priority: 4,
    cooldownMs: 85000,
  },
  {
    id: "playbook-downloads",
    tone: "launch",
    badge: "FREE",
    title: "Explore the GenAI diagram collection",
    message:
      "Browse free diagrams on chunking, embeddings, MCP, RAG, and transformers.",
    action: { label: "Browse Library", type: "command", value: "marketplace" },
    priority: 4,
    cooldownMs: 80000,
  },
  {
    id: "mentorship-social-proof",
    tone: "social-proof",
    badge: "ACTIVE",
    title: "Bring your next idea to a mentorship session",
    message:
      "Get focused help turning an idea into a practical, demo-ready architecture.",
    action: {
      label: "Discuss Mentorship",
      type: "ask",
      value: "I want hackathon mentorship support",
    },
    priority: 3,
    cooldownMs: 90000,
  },
  {
    id: "rag-handbook",
    tone: "offer",
    badge: "FREE",
    title: "RAG diagrams are in the library",
    message:
      "A practical reference for retrieval quality, evaluation, and rollout decisions.",
    action: {
      label: "Explore diagrams",
      type: "command",
      value: "marketplace",
    },
    priority: 3,
    cooldownMs: 85000,
  },
  {
    id: "portfolio-update",
    tone: "offer",
    badge: "UPDATE",
    title: "Explore my engineering work",
    message:
      "Open my work section to scan architecture choices, role, and measurable outcomes.",
    action: { label: "Open Work", type: "command", value: "work" },
    priority: 3,
    cooldownMs: 65000,
  },
];

export const DOWNLOADS: DownloadableResource[] = [];

export const DOCS: LockedDocument[] = [
  {
    slug: "kafka-systems-field-guide",
    title: "Kafka Systems Field Guide",
    description:
      "Topics, partitions, delivery guarantees, and production operations for Apache Kafka.",
    fileName: "kafka-systems-field-guide.pdf",
    priceCents: 500,
    pageCount: 51,
    previewPages: 5,
  },
];

// display-only metadata for the marketplace grid/reader; slugs must match DOCS/DOWNLOADS
interface MarketplaceMeta {
  pageCount: number;
  freePages: number;
  updated: string;
  format: string;
  image: string;
  intro: string;
  chapters: { num: string; title: string; pages: string }[];
  audience: string[];
  tags: string[];
}

const MARKETPLACE_META: Record<string, MarketplaceMeta> = {
  "kafka-systems-field-guide": {
    pageCount: 51,
    freePages: 5,
    updated: "2026-07-14",
    format: "pdf",
    image: "/images/marketplace/kafka-systems-field-guide.svg",
    intro:
      "A working reference for teams already running Kafka in production. It starts at the storage model, then follows a message through partitioning, delivery guarantees, consumer groups, and rebalances, and ends with the operational work: sizing, monitoring, and the incidents that keep recurring.",
    chapters: [
      { num: "01", title: "The log as storage primitive", pages: "p. 3" },
      { num: "02", title: "Topics, partitions, and keys", pages: "p. 9" },
      {
        num: "03",
        title: "Producers: batching and idempotence",
        pages: "p. 17",
      },
      { num: "04", title: "Delivery guarantees in practice", pages: "p. 24" },
      { num: "05", title: "Consumer groups and rebalances", pages: "p. 33" },
      { num: "06", title: "Sizing, retention, and cost", pages: "p. 41" },
      { num: "07", title: "Incident patterns and runbooks", pages: "p. 46" },
    ],
    audience: [
      "Engineers operating a Kafka cluster they did not originally set up.",
      "Backend teams choosing between queues and an event log.",
      "Architects who need delivery guarantees stated precisely enough to review.",
    ],
    tags: ["topics", "partitions", "consumer groups"],
  },
  "vscode-optimization-handbook": {
    pageCount: 12,
    freePages: 3,
    updated: "2026-02-20",
    format: "pdf",
    image: "/images/marketplace/vscode-optimization-handbook.svg",
    intro:
      "Everything that makes a large workspace feel instant again: extension budgets, per-language settings, file watcher exclusions, and a debugging setup you configure once and reuse across projects.",
    chapters: [
      { num: "01", title: "Profiling a slow editor", pages: "p. 2" },
      { num: "02", title: "Extension budgets and profiles", pages: "p. 4" },
      {
        num: "03",
        title: "Workspace and per-language settings",
        pages: "p. 6",
      },
      { num: "04", title: "Debug configurations worth keeping", pages: "p. 9" },
      { num: "05", title: "Keyboard-first workflow", pages: "p. 11" },
    ],
    audience: [
      "Developers whose editor slows down in monorepos.",
      "Teams standardising a shared workspace configuration.",
      "Anyone moving from a heavier IDE.",
    ],
    tags: ["editor setup", "extensions", "debugging", "workflow"],
  },
  "production-rag-playbook": {
    pageCount: 14,
    freePages: 3,
    updated: "2026-01-15",
    format: "pdf",
    image: "/images/marketplace/production-rag-playbook.svg",
    intro:
      "The decisions that determine whether a retrieval system survives contact with real documents: chunking strategy, hybrid retrieval, evaluation sets you can trust, and the failure modes that only appear under load.",
    chapters: [
      { num: "01", title: "Chunking and document structure", pages: "p. 2" },
      { num: "02", title: "Hybrid retrieval and reranking", pages: "p. 5" },
      { num: "03", title: "Building an evaluation set", pages: "p. 8" },
      { num: "04", title: "Observability and drift", pages: "p. 11" },
      { num: "05", title: "Rollout and guardrails", pages: "p. 13" },
    ],
    audience: [
      "Teams shipping their first retrieval-backed feature.",
      "Engineers whose prototype answers well in demos and poorly in production.",
      "Leads who need an evaluation story before launch.",
    ],
    tags: ["retrieval", "evaluation", "observability", "rollout"],
  },
  "event-driven-systems-checklist": {
    pageCount: 2,
    freePages: 2,
    updated: "2026-03-01",
    format: "pdf",
    image: "/images/marketplace/event-driven-systems-checklist.svg",
    intro:
      "A two-page review checklist for teams moving their first service onto events: topic design, retry and dead-letter policy, idempotence, and the operational checks to run before launch.",
    chapters: [
      { num: "01", title: "Topic and schema review", pages: "p. 1" },
      { num: "02", title: "Retries, DLQs, and operations", pages: "p. 2" },
    ],
    audience: [
      "Teams running a design review before their first event-driven service.",
      "Reviewers who want a shared checklist instead of tribal knowledge.",
    ],
    tags: ["topics", "retries", "delivery guarantees", "operations"],
  },
};

function buildMarketplace(): MarketplaceDoc[] {
  const fromDocs = DOCS.map((doc) => ({
    slug: doc.slug,
    title: doc.title,
    description: doc.description,
    fileName: doc.fileName,
    priceCents: doc.priceCents,
    ...MARKETPLACE_META[doc.slug],
  }));
  const fromDownloads = DOWNLOADS.map((resource) => ({
    slug: resource.slug,
    title: resource.title,
    description: resource.description,
    fileName: resource.fileName,
    priceCents: resource.priceCents,
    ...MARKETPLACE_META[resource.slug],
  }));
  return [...fromDocs, ...fromDownloads];
}

export const MARKETPLACE: MarketplaceDoc[] = buildMarketplace();

export const HEADS = [
  "Solution architect. I turn complex systems into products that ship.",
  "From distributed platforms to GenAI, designed for production.",
  "Architecture that gives teams clarity, speed, and room to scale.",
  "9 years building reliable systems people can depend on.",
];

export const TIPS: [command: string, hint: string][] = [
  ["work", "— what I have shipped"],
  ["consulting", "— first 30 minutes are free"],
  ["cv", "— download the full record"],
  ["ask", "— chat with my assistant"],
  ["links", "— github, medium, linkedin"],
  ["help", "— every command"],
];

export const SUGGESTIONS = [
  "How do you design event-driven systems?",
  "What did you build at 360T?",
  "What does it take to make a RAG setup production-ready?",
  "What do you consult on, and how does the free 30 minutes work?",
];
