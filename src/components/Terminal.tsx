"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ALIAS,
  KNOWN,
  TIPS,
} from "@/lib/content";
import type { Entry } from "@/lib/types";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import Hero from "./Hero";
import AskAnkit, { type AskAnkitHandle } from "./AskAnkit";
import OnboardingTour from "./OnboardingTour";
import TerminalOnboarding from "./TerminalOnboarding";
import { useLanguage } from "./LanguageProvider";
import { track } from "@/lib/analytics";
import {
  AboutOutput,
  CertsOutput,
  ContactOutput,
  CvOutput,
  HelpOutput,
  LinksOutput,
  NotFoundOutput,
  OffersOutput,
  StackOutput,
  WorkOutput,
} from "./CommandOutputs";

function eggOutput(key: string, onRun: (cmd: string) => void) {
  switch (key) {
    case "sudo":
      return <div className="block red">ankit is not in the sudoers file. This incident has been reported.</div>;
    case "exit":
    case "logout":
      return (
        <div className="block dim">
          There is no exit — but you can{" "}
          <span className="green" style={{ cursor: "pointer" }} onClick={() => onRun("contact")}>
            book a call
          </span>
          . logout: 8 jobs running.
        </div>
      );
    case "rm -rf":
    case "rm -rf /":
      return <div className="block amber">Nice try. This machine has backups, and a sense of self-preservation.</div>;
    case "pwd":
      return <div className="block">/home/ankit</div>;
    case "date":
      return <div className="block">{new Date().toString()}</div>;
    case "uname":
    case "uname -a":
      return <div className="block">AnkitOS distributed-systems 8.2.0-prod x86_64 GNU/Linux</div>;
    default:
      return null;
  }
}

const EGG_KEYS = new Set(["sudo", "exit", "logout", "rm -rf", "rm -rf /", "pwd", "date", "uname", "uname -a"]);

export default function Terminal() {
  const { translate } = useLanguage();
  const [entries, setEntries] = useState<Entry[]>([{ id: 0, kind: "hero" }]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [tipIdx, setTipIdx] = useState(0);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const [terminalOnboarding, setTerminalOnboarding] = useState(false);
  // single source of truth for the sidebar's persistent prompt (`visitor@ankit:~$`)
  const [path, setPath] = useState("~");
  const idRef = useRef(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const askRef = useRef<AskAnkitHandle>(null);
  const nextId = () => idRef.current++;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing the first-visit tour from localStorage after hydration
    if (window.localStorage.getItem("ankit-onboarding-complete") !== "1") setTourStep(0);
  }, []);

  useEffect(() => {
    const section = path === "~" ? "" : path.replace("~/", "");
    const label = section ? `${section.charAt(0).toUpperCase()}${section.slice(1)} — ` : "";
    document.title = `${label}ankit@ulm: ${path} — Ankit Anand`;
  }, [path]);

  const scrollBottom = () => {
    requestAnimationFrame(() => {
      if (contentRef.current) contentRef.current.scrollTop = contentRef.current.scrollHeight;
    });
  };
  const scrollTop = () => {
    requestAnimationFrame(() => {
      if (contentRef.current) contentRef.current.scrollTop = 0;
    });
  };

  const openAsk = (query?: string) => {
    askRef.current?.open();
    if (query) askRef.current?.ask(query);
  };

  // `replace` is used by the sidebar's tab-style nav: each tab shows only its own
  // output instead of piling onto the previous command's output.
  const run = (raw: string, opts?: { replace?: boolean }) => {
    const clean = raw.trim();
    if (!clean) return;
    setHistory((h) => [...h, clean]);
    setHistIdx(-1);
    const low = clean.toLowerCase();
    const replace = opts?.replace ?? false;
    const commit = (newOnes: Entry[]) => {
      setEntries((e) => (replace ? newOnes : [...e, ...newOnes]));
      if (replace) scrollTop();
      else scrollBottom();
    };

    if (EGG_KEYS.has(low)) {
      const cmdEntry: Entry = { id: nextId(), kind: "cmd", text: clean };
      const outEntry: Entry = { id: nextId(), kind: "output", node: eggOutput(low, run) };
      commit([cmdEntry, outEntry]);
      return;
    }

    const key = (ALIAS[low] || low) === "consulting" ? "contact" : (ALIAS[low] || low);
    if (KNOWN.includes(key)) track("section_view", { section: key });

    if (key === "ask") {
      openAsk();
      return;
    }
    if (key === "home") {
      setPath("~");
      if (replace) {
        setEntries([{ id: nextId(), kind: "hero" }]);
        scrollTop();
      } else {
        setEntries((e) => (e[e.length - 1]?.kind === "hero" ? e : [...e, { id: nextId(), kind: "hero" }]));
        scrollBottom();
      }
      return;
    }
    if (key === "clear") {
      setEntries([]);
      return;
    }

    setPath(`~/${key}`);

    let node: React.ReactNode;
    switch (key) {
      case "help":
        node = <HelpOutput onRun={run} />;
        break;
      case "offers":
        node = <OffersOutput onRun={run} onAsk={(q) => openAsk(q)} />;
        break;
      case "about":
        node = <AboutOutput />;
        break;
      case "work":
        node = <WorkOutput />;
        break;
      case "stack":
        node = <StackOutput />;
        break;
      case "certs":
        node = <CertsOutput />;
        break;
      case "cv":
        node = <CvOutput />;
        break;
      case "contact":
        node = <ContactOutput />;
        break;
      case "links":
        node = <LinksOutput />;
        break;
      default:
        node = <NotFoundOutput cmd={clean} onRun={run} />;
    }

    const outEntry: Entry = { id: nextId(), kind: "output", node };
    commit([outEntry]);
  };

  // rotate the ghost-hint tip every ~2.9s while the input is empty
  useEffect(() => {
    const t = setInterval(() => {
      if (!inputRef.current?.value) setTipIdx((i) => (i + 1) % TIPS.length);
    }, 2900);
    return () => clearInterval(t);
  }, []);

  const ghost = useMemo(() => (input ? null : TIPS[tipIdx % TIPS.length]), [input, tipIdx]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const v = input;
      setInput("");
      // each typed command replaces the screen, showing only its own result
      run(v, { replace: true });
      return;
    }
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      if (!history.length) return;
      let i = histIdx < 0 ? history.length : histIdx;
      i = e.key === "ArrowUp" ? Math.max(0, i - 1) : Math.min(history.length, i + 1);
      const newIdx = i >= history.length ? -1 : i;
      setHistIdx(newIdx);
      setInput(newIdx === -1 ? "" : history[newIdx]);
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const v = input.trim().toLowerCase();
      const hit = v && KNOWN.find((k) => k.indexOf(v) === 0);
      if (hit) setInput(hit);
    }
  };

  const finishOnboarding = () => {
    window.localStorage.setItem("ankit-onboarding-complete", "1");
    setTourStep(null);
    setTerminalOnboarding(false);
  };

  const advanceOnboarding = () => {
    if (tourStep === null) return;
    if (tourStep < 4) {
      setTourStep(tourStep + 1);
    } else {
      setTourStep(null);
      setTerminalOnboarding(true);
    }
  };

  return (
    <div id="shell">
      <TopBar onRun={(cmd) => run(cmd, { replace: true })} />
      <div id="shellbody">
        <Sidebar onRun={(cmd) => run(cmd, { replace: true })} path={path} />
        <main
          id="content"
          ref={contentRef}
          tabIndex={-1}
        >
          <div id="contentinner">
            <div id="log">
              {entries.map((entry) => {
                if (entry.kind === "hero")
                  return (
                    <Hero
                      key={entry.id}
                      onRun={(cmd) => run(cmd, { replace: true })}
                    />
                  );
                if (entry.kind === "cmd")
                  return (
                    <div className="cmdline entry" key={entry.id}>
                      <span className="cmd-echo">$ {entry.text}</span>
                    </div>
                  );
                return (
                  <div className="block entry" key={entry.id}>
                    {entry.node}
                  </div>
                );
              })}
            </div>

            {path === "~" && (
              <div id="promptline" className={terminalOnboarding ? "onboarding-spotlight" : undefined}>
                <span className="prompt-caret">&gt;</span>
                <span id="inputwrap">
                  <input
                    id="cmd"
                    ref={inputRef}
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    aria-label={translate("terminal command")}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                  />
                  {ghost && (
                    <span id="ghost">
                      <span className="curs blink" />
                      <span className="green">{ghost[0]}</span>
                      <span className="dim" style={{ fontSize: ".9em" }}>
                        {translate(ghost[1])}
                      </span>
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
        </main>
      </div>
      <AskAnkit ref={askRef} />
      <OnboardingTour
        active={tourStep !== null}
        stepIndex={tourStep ?? 0}
        total={5}
        onAdvance={advanceOnboarding}
        onSkip={finishOnboarding}
      />
      <TerminalOnboarding
        open={terminalOnboarding}
        step={5}
        total={5}
        onTryHelp={() => {
          finishOnboarding();
          run("help", { replace: true });
        }}
        onSkip={finishOnboarding}
      />
    </div>
  );
}
