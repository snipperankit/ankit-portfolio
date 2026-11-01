"use client";

import { BriefcaseBusiness, FileText, Home, Mail, UserRound } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

const NAV_ITEMS = [
  { command: "home", label: "Home", icon: Home },
  { command: "about", label: "About", icon: UserRound },
  { command: "work", label: "Work", icon: BriefcaseBusiness },
  { command: "cv", label: "CV", icon: FileText },
  { command: "contact", label: "Contact", icon: Mail },
];

export default function Sidebar({ onRun, path, visible = true }: { onRun: (cmd: string) => void; path: string; visible?: boolean }) {
  const { translate } = useLanguage();
  const active = path === "~" ? "home" : path.replace("~/", "");
  return (
    <nav id="sidebar" aria-label={translate("Main navigation")} className={visible ? "" : "chrome-hidden"}>
      {NAV_ITEMS.map(({ command, label, icon: Icon }) => (
        <button
          key={command}
          className={`navbtn${command === active ? " active" : ""}`}
          aria-current={command === active ? "page" : undefined}
          onClick={(event) => { onRun(command); event.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" }); }}
        >
          <Icon size={17} aria-hidden="true" />{translate(label)}
        </button>
      ))}
    </nav>
  );
}
