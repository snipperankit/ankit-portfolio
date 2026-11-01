import type { ReactNode } from "react";

export type EntryKind = "hero" | "cmd" | "output";

export interface CmdEntry {
  id: number;
  kind: "cmd";
  text: string;
}

export interface OutputEntry {
  id: number;
  kind: "output";
  node: ReactNode;
}

export interface HeroEntry {
  id: number;
  kind: "hero";
}

export type Entry = HeroEntry | CmdEntry | OutputEntry;

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type FlashNoticeTone = "social-proof" | "launch" | "offer" | "event";

export interface FlashNoticeAction {
  label: string;
  type: "command" | "ask" | "link";
  value: string;
  newTab?: boolean;
}

export interface FlashNotice {
  id: string;
  tone: FlashNoticeTone;
  badge?: string;
  title: string;
  message: string;
  action?: FlashNoticeAction;
  priority?: number;
  cooldownMs?: number;
  startAt?: string;
  endAt?: string;
  socialProofCount?: {
    min: number;
    max: number;
  };
}

export interface DownloadableResource {
  slug: string;
  title: string;
  description: string;
  category: "PLAYBOOK" | "HANDBOOK" | "CHECKLIST";
  fileName: string;
  priceCents?: number;
}

export interface LockedDocument {
  slug: string;
  title: string;
  description: string;
  fileName: string;
  priceCents: number;
  pageCount: number;
  previewPages: number;
}

export interface MarketplaceChapter {
  num: string;
  title: string;
  pages: string;
}

export interface MarketplaceDoc {
  slug: string;
  title: string;
  description: string;
  fileName: string;
  priceCents?: number;
  pageCount: number;
  freePages: number;
  updated: string;
  format: string;
  image: string;
  intro: string;
  chapters: MarketplaceChapter[];
  audience: string[];
  tags: string[];
}
