export default function Ps1({ path = "~" }: { path?: string }) {
  return (
    <span className="ps1">
      <span className="u">visitor</span>
      <span className="at">@</span>
      <span className="h">ankit</span>
      <span className="d">:</span>
      <span className="p">{path}</span>
      <span className="d">$</span>
    </span>
  );
}
