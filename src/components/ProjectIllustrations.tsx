// Decorative SVG illustrations for each project card, ported 1:1 from the original static build.
export function ChatbotIllustration() {
  return (
    <svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="120" fill="#11140f" />
      <rect x="40" y="20" width="90" height="50" rx="8" fill="none" stroke="#2f4f32" strokeWidth="1.5" />
      <line x1="60" y1="38" x2="110" y2="38" stroke="#3a5a3d" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="48" x2="100" y2="48" stroke="#3a5a3d" strokeWidth="2" strokeLinecap="round" />
      <line x1="60" y1="58" x2="90" y2="58" stroke="#3a5a3d" strokeWidth="2" strokeLinecap="round" />
      <polygon points="65,70 75,80 55,80" fill="#2f4f32" />
      <rect x="160" y="30" width="90" height="50" rx="8" fill="none" stroke="#8fd98f" strokeWidth="1.5" />
      <line x1="180" y1="48" x2="230" y2="48" stroke="#8fd98f" strokeWidth="2" strokeLinecap="round" opacity=".7" />
      <line x1="180" y1="58" x2="220" y2="58" stroke="#8fd98f" strokeWidth="2" strokeLinecap="round" opacity=".7" />
      <line x1="180" y1="68" x2="210" y2="68" stroke="#8fd98f" strokeWidth="2" strokeLinecap="round" opacity=".7" />
      <polygon points="235,80 225,90 245,90" fill="#8fd98f" opacity=".5" />
      <circle cx="300" cy="40" r="14" fill="none" stroke="#8fd98f" strokeWidth="1.2" opacity=".5" />
      <circle cx="340" cy="60" r="10" fill="none" stroke="#8fd98f" strokeWidth="1.2" opacity=".4" />
      <circle cx="360" cy="35" r="8" fill="none" stroke="#8fd98f" strokeWidth="1.2" opacity=".3" />
      <line x1="314" y1="40" x2="330" y2="55" stroke="#2f4f32" strokeWidth="1" />
      <line x1="314" y1="38" x2="352" y2="36" stroke="#2f4f32" strokeWidth="1" />
      <line x1="348" y1="56" x2="356" y2="40" stroke="#2f4f32" strokeWidth="1" />
      <text x="300" y="96" fill="#3a5a3d" fontFamily="monospace" fontSize="9" textAnchor="middle">MCP gateway</text>
    </svg>
  );
}

export function KnowledgeGraphIllustration() {
  return (
    <svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="120" fill="#11140f" />
      <circle cx="110" cy="60" r="18" fill="none" stroke="#8fd98f" strokeWidth="1.5" />
      <circle cx="200" cy="30" r="14" fill="none" stroke="#8fd98f" strokeWidth="1.2" opacity=".7" />
      <circle cx="200" cy="90" r="14" fill="none" stroke="#8fd98f" strokeWidth="1.2" opacity=".7" />
      <circle cx="290" cy="60" r="18" fill="none" stroke="#8fd98f" strokeWidth="1.5" />
      <circle cx="290" cy="60" r="6" fill="#8fd98f" opacity=".3" />
      <circle cx="110" cy="60" r="6" fill="#8fd98f" opacity=".3" />
      <circle cx="50" cy="40" r="10" fill="none" stroke="#3a5a3d" strokeWidth="1" />
      <circle cx="50" cy="85" r="10" fill="none" stroke="#3a5a3d" strokeWidth="1" />
      <circle cx="350" cy="35" r="10" fill="none" stroke="#3a5a3d" strokeWidth="1" />
      <circle cx="350" cy="85" r="10" fill="none" stroke="#3a5a3d" strokeWidth="1" />
      <line x1="60" y1="43" x2="92" y2="55" stroke="#2f4f32" strokeWidth="1.2" />
      <line x1="60" y1="82" x2="92" y2="65" stroke="#2f4f32" strokeWidth="1.2" />
      <line x1="128" y1="52" x2="186" y2="34" stroke="#2f4f32" strokeWidth="1.2" />
      <line x1="128" y1="68" x2="186" y2="86" stroke="#2f4f32" strokeWidth="1.2" />
      <line x1="214" y1="34" x2="272" y2="52" stroke="#2f4f32" strokeWidth="1.2" />
      <line x1="214" y1="86" x2="272" y2="68" stroke="#2f4f32" strokeWidth="1.2" />
      <line x1="308" y1="55" x2="340" y2="40" stroke="#2f4f32" strokeWidth="1.2" />
      <line x1="308" y1="68" x2="340" y2="82" stroke="#2f4f32" strokeWidth="1.2" />
      <text x="200" y="115" fill="#3a5a3d" fontFamily="monospace" fontSize="9" textAnchor="middle">semantic knowledge graph</text>
    </svg>
  );
}

export function VectorSearchIllustration() {
  return (
    <svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="120" fill="#11140f" />
      <circle cx="90" cy="55" r="26" fill="none" stroke="#8fd98f" strokeWidth="1.8" />
      <line x1="108" y1="73" x2="130" y2="95" stroke="#8fd98f" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="75" y1="50" x2="105" y2="50" stroke="#3a5a3d" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="78" y1="58" x2="102" y2="58" stroke="#3a5a3d" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="80" y1="66" x2="98" y2="66" stroke="#3a5a3d" strokeWidth="1.5" strokeLinecap="round" />
      <g transform="translate(180,20)">
        <line x1="0" y1="40" x2="40" y2="15" stroke="#8fd98f" strokeWidth="1" opacity=".6" /><circle cx="44" cy="13" r="3" fill="#8fd98f" opacity=".5" />
        <line x1="0" y1="40" x2="45" y2="35" stroke="#8fd98f" strokeWidth="1" opacity=".6" /><circle cx="49" cy="34" r="3" fill="#8fd98f" opacity=".5" />
        <line x1="0" y1="40" x2="35" y2="60" stroke="#8fd98f" strokeWidth="1" opacity=".6" /><circle cx="38" cy="63" r="3" fill="#8fd98f" opacity=".5" />
        <line x1="0" y1="40" x2="50" y2="55" stroke="#8fd98f" strokeWidth="1" opacity=".6" /><circle cx="54" cy="57" r="3" fill="#8fd98f" opacity=".5" />
        <line x1="0" y1="40" x2="55" y2="75" stroke="#8fd98f" strokeWidth="1" opacity=".4" /><circle cx="58" cy="78" r="3" fill="#8fd98f" opacity=".3" />
        <circle cx="0" cy="40" r="4" fill="#8fd98f" opacity=".7" />
      </g>
      <g transform="translate(290,15)">
        <rect x="0" y="0" width="70" height="16" rx="3" fill="none" stroke="#2f4f32" strokeWidth="1" />
        <rect x="3" y="3" width="48" height="10" rx="2" fill="#8fd98f" opacity=".3" />
        <rect x="0" y="22" width="70" height="16" rx="3" fill="none" stroke="#2f4f32" strokeWidth="1" />
        <rect x="3" y="25" width="60" height="10" rx="2" fill="#8fd98f" opacity=".25" />
        <rect x="0" y="44" width="70" height="16" rx="3" fill="none" stroke="#2f4f32" strokeWidth="1" />
        <rect x="3" y="47" width="35" height="10" rx="2" fill="#8fd98f" opacity=".2" />
        <rect x="0" y="66" width="70" height="16" rx="3" fill="none" stroke="#2f4f32" strokeWidth="1" />
        <rect x="3" y="69" width="22" height="10" rx="2" fill="#8fd98f" opacity=".15" />
      </g>
      <text x="325" y="108" fill="#3a5a3d" fontFamily="monospace" fontSize="9" textAnchor="middle">10K+ req/min</text>
    </svg>
  );
}

export function SdlcIllustration() {
  return (
    <svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="120" fill="#11140f" />
      <rect x="30" y="42" width="56" height="36" rx="5" fill="none" stroke="#3a5a3d" strokeWidth="1.2" />
      <text x="58" y="64" fill="#3a5a3d" fontFamily="monospace" fontSize="10" textAnchor="middle">CODE</text>
      <line x1="86" y1="60" x2="115" y2="60" stroke="#2f4f32" strokeWidth="1.5" markerEnd="url(#sdlc-arrow)" />
      <rect x="115" y="42" width="56" height="36" rx="5" fill="none" stroke="#8fd98f" strokeWidth="1.2" />
      <text x="143" y="57" fill="#8fd98f" fontFamily="monospace" fontSize="9" textAnchor="middle">RAG</text>
      <text x="143" y="70" fill="#8fd98f" fontFamily="monospace" fontSize="9" textAnchor="middle">+ AI</text>
      <line x1="171" y1="60" x2="200" y2="60" stroke="#2f4f32" strokeWidth="1.5" markerEnd="url(#sdlc-arrow)" />
      <rect x="200" y="42" width="56" height="36" rx="5" fill="none" stroke="#3a5a3d" strokeWidth="1.2" />
      <text x="228" y="64" fill="#3a5a3d" fontFamily="monospace" fontSize="10" textAnchor="middle">TEST</text>
      <line x1="256" y1="60" x2="285" y2="60" stroke="#2f4f32" strokeWidth="1.5" markerEnd="url(#sdlc-arrow)" />
      <rect x="285" y="42" width="56" height="36" rx="5" fill="none" stroke="#3a5a3d" strokeWidth="1.2" />
      <text x="313" y="64" fill="#3a5a3d" fontFamily="monospace" fontSize="10" textAnchor="middle">SHIP</text>
      <line x1="341" y1="60" x2="370" y2="60" stroke="#2f4f32" strokeWidth="1.5" />
      <circle cx="377" cy="60" r="6" fill="#8fd98f" opacity=".4" />
      <g fill="#8fd98f" opacity=".5"><polygon points="143,28 146,34 152,35 148,39 149,45 143,42 137,45 138,39 134,35 140,34" /></g>
      <text x="200" y="108" fill="#3a5a3d" fontFamily="monospace" fontSize="9" textAnchor="middle">cycle time -40%</text>
      <defs><marker id="sdlc-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#2f4f32" /></marker></defs>
    </svg>
  );
}

export const PROJECT_ILLUSTRATIONS = [
  ChatbotIllustration,
  KnowledgeGraphIllustration,
  VectorSearchIllustration,
  SdlcIllustration,
];
