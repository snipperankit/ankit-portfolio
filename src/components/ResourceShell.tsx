"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import TopBar from "./TopBar";
import { useLanguage } from "./LanguageProvider";

export default function ResourceShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { translate } = useLanguage();
  return <div id="shell">
    <TopBar marketplace onRun={() => router.push("/")} />
    <main id="content" className="resource-page">
      <nav className="resource-nav" aria-label={translate("Resource navigation")}>
        <Link href="/">{translate("Home")}</Link>
        <Link href="/resources">{translate("All resources")}</Link>
        <span>{translate("English only, for now")}</span>
      </nav>
      <div lang="en" translate="no">{children}</div>
    </main>
  </div>;
}