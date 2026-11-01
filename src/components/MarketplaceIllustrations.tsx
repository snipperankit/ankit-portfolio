// Decorative SVG cover illustrations for marketplace documents, styled to match ProjectIllustrations.tsx.
export function KafkaIllustration() {
  return (
    <svg viewBox="0 0 400 132" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="400" height="132" fill="#11140f" />
      <polygon points="120,40 145,54 145,82 120,96 95,82 95,54" fill="none" stroke="#8fd98f" strokeWidth="1.5" />
      <polygon points="210,28 235,42 235,70 210,84 185,70 185,42" fill="none" stroke="#8fd98f" strokeWidth="1.5" opacity=".8" />
      <polygon points="300,48 325,62 325,90 300,104 275,90 275,62" fill="none" stroke="#8fd98f" strokeWidth="1.5" opacity=".6" />
      <line x1="145" y1="68" x2="185" y2="56" stroke="#2f4f32" strokeWidth="1.2" />
      <line x1="235" y1="56" x2="275" y2="68" stroke="#2f4f32" strokeWidth="1.2" />
      <circle cx="163" cy="62" r="3" fill="#8fd98f" opacity=".6" />
      <circle cx="255" cy="62" r="3" fill="#8fd98f" opacity=".5" />
      <line x1="112" y1="60" x2="128" y2="60" stroke="#3a5a3d" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="112" y1="68" x2="128" y2="68" stroke="#3a5a3d" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="112" y1="76" x2="128" y2="76" stroke="#3a5a3d" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function VscodeIllustration() {
  return (
    <svg viewBox="0 0 400 132" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="400" height="132" fill="#11140f" />
      <rect x="100" y="26" width="200" height="70" rx="6" fill="none" stroke="#8fd98f" strokeWidth="1.5" />
      <circle cx="112" cy="38" r="3" fill="#3a5a3d" />
      <circle cx="122" cy="38" r="3" fill="#3a5a3d" />
      <circle cx="132" cy="38" r="3" fill="#3a5a3d" />
      <line x1="100" y1="46" x2="300" y2="46" stroke="#2f4f32" strokeWidth="1" />
      <line x1="112" y1="60" x2="130" y2="60" stroke="#2f4f32" strokeWidth="1.4" />
      <line x1="112" y1="70" x2="180" y2="70" stroke="#8fd98f" strokeWidth="1.4" opacity=".7" />
      <line x1="122" y1="80" x2="200" y2="80" stroke="#8fd98f" strokeWidth="1.4" opacity=".5" />
      <line x1="112" y1="90" x2="160" y2="90" stroke="#2f4f32" strokeWidth="1.4" />
      <rect x="245" y="55" width="42" height="30" rx="3" fill="none" stroke="#3a5a3d" strokeWidth="1" opacity=".7" />
    </svg>
  );
}

export function RagIllustration() {
  return (
    <svg viewBox="0 0 400 132" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="400" height="132" fill="#11140f" />
      <circle cx="115" cy="60" r="22" fill="none" stroke="#8fd98f" strokeWidth="1.8" />
      <line x1="131" y1="76" x2="150" y2="95" stroke="#8fd98f" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="103" y1="55" x2="127" y2="55" stroke="#3a5a3d" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="105" y1="63" x2="125" y2="63" stroke="#3a5a3d" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="180" y1="60" x2="215" y2="42" stroke="#2f4f32" strokeWidth="1.1" />
      <line x1="180" y1="60" x2="215" y2="60" stroke="#2f4f32" strokeWidth="1.1" />
      <line x1="180" y1="60" x2="215" y2="78" stroke="#2f4f32" strokeWidth="1.1" />
      <rect x="215" y="32" width="60" height="18" rx="3" fill="none" stroke="#8fd98f" strokeWidth="1" opacity=".7" />
      <rect x="215" y="51" width="60" height="18" rx="3" fill="none" stroke="#8fd98f" strokeWidth="1" opacity=".5" />
      <rect x="215" y="70" width="60" height="18" rx="3" fill="none" stroke="#8fd98f" strokeWidth="1" opacity=".3" />
      <line x1="290" y1="41" x2="320" y2="41" stroke="#2f4f32" strokeWidth="1.2" />
      <line x1="290" y1="60" x2="320" y2="60" stroke="#2f4f32" strokeWidth="1.2" />
      <line x1="290" y1="79" x2="320" y2="79" stroke="#2f4f32" strokeWidth="1.2" />
      <circle cx="330" cy="41" r="5" fill="#8fd98f" opacity=".5" />
      <circle cx="330" cy="60" r="5" fill="#8fd98f" opacity=".4" />
      <circle cx="330" cy="79" r="5" fill="#8fd98f" opacity=".3" />
    </svg>
  );
}

export function ChecklistIllustration() {
  return (
    <svg viewBox="0 0 400 132" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect width="400" height="132" fill="#11140f" />
      {[0, 1, 2].map((i) => {
        const y = 34 + i * 26;
        const opacity = 1 - i * 0.2;
        return (
          <g key={i}>
            <rect x="140" y={y} width="18" height="18" rx="3" fill="none" stroke="#8fd98f" strokeWidth="1.5" opacity={opacity} />
            <path d={`M144,${y + 9} l4,4 l8,-9`} fill="none" stroke="#8fd98f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity={opacity} />
            <line x1="168" y1={y + 9} x2="260" y2={y + 9} stroke="#3a5a3d" strokeWidth="1.4" strokeLinecap="round" opacity={opacity} />
          </g>
        );
      })}
    </svg>
  );
}

export const MARKETPLACE_ILLUSTRATIONS: Record<string, () => React.JSX.Element> = {
  "kafka-systems-field-guide": KafkaIllustration,
  "vscode-optimization-handbook": VscodeIllustration,
  "production-rag-playbook": RagIllustration,
  "event-driven-systems-checklist": ChecklistIllustration,
};
