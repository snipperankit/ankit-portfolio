"use client";

export default function StatusBar({ visible = true }: { visible?: boolean } = {}) {
  return (
    <div id="statusbar" className={visible ? "" : "chrome-hidden"}>
      <span>tty1</span>
      <span>·</span>
      <span>↑↓ history</span>
      <span>·</span>
      <span>TAB complete</span>
      <span>·</span>
      <span>bash 5.2</span>
    </div>
  );
}
