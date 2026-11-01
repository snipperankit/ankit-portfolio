"use client";

import Image from "next/image";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { PERSONA, SUGGESTIONS } from "@/lib/content";
import type { ChatMessage } from "@/lib/types";
import assistantAvatar from "../../public/images/assistant-avatar.png";
import { Mic, X } from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import { track } from "@/lib/analytics";

export interface AskAnkitHandle {
  open: () => void;
  ask: (question: string) => void;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: { transcript: string };
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

async function callChatApi(messages: ChatMessage[], language: "en" | "de"): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system: PERSONA, messages: messages.slice(-20), language }),
  });
  if (!res.ok) throw new Error("http " + res.status);
  const data = await res.json();
  return String(data.reply ?? data.text ?? "").trim();
}

const AskAnkit = forwardRef<AskAnkitHandle>(function AskAnkit(_props, ref) {
  const { language, translate } = useLanguage();
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [input, setInput] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const chatRef = useRef(chat);
  chatRef.current = chat;

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [chat, thinking]);

  const speak = (text: string) => {
    if (!voiceOn || typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.02;
      u.pitch = 0.95;
      u.lang = language === "de" ? "de-DE" : "en-GB";
      const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith(language));
      if (voice) u.voice = voice;
      window.speechSynthesis.speak(u);
    } catch {
      // speech synthesis is best-effort
    }
  };

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || thinking) return;
    setInput("");
    const nextChat = [...chatRef.current, { role: "user" as const, content: q }];
    setChat(nextChat);
    setThinking(true);
    try {
      const reply = await callChatApi(nextChat, language);
      const text =
        reply || translate("The assistant is unavailable right now. Email anand.ankit093@gmail.com or use contact.");
      setChat((c) => [...c, { role: "assistant", content: text }]);
      speak(text);
    } catch {
      setChat((c) => [
        ...c,
        {
          role: "assistant",
          content:
            translate("The assistant is unavailable right now. Email anand.ankit093@gmail.com or use contact."),
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  useImperativeHandle(ref, () => ({
    open: () => { setOpen(true); track("assistant_opened"); },
    ask,
  }));

  const toggleMic = () => {
    const SR: (new () => SpeechRecognitionLike) | undefined =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
    if (!SR) {
      setChat((c) => [
        ...c,
        { role: "assistant", content: translate("Voice input isn't supported in this browser — type instead.") },
      ]);
      return;
    }
    if (recRef.current) {
      try {
        recRef.current.stop();
      } catch {
        // ignore
      }
      recRef.current = null;
      setMicOn(false);
      return;
    }
    const rec = new SR();
    rec.lang = language === "de" ? "de-DE" : "en-US";
    rec.interimResults = true;
    rec.onresult = (ev) => {
      let t = "";
      for (let i = 0; i < ev.results.length; i++) t += ev.results[i][0].transcript;
      setInput(t);
      if (ev.results[ev.results.length - 1].isFinal) {
        recRef.current = null;
        setMicOn(false);
        ask(t);
      }
    };
    rec.onerror = () => {
      recRef.current = null;
      setMicOn(false);
    };
    rec.onend = () => {
      recRef.current = null;
      setMicOn(false);
    };
    try {
      rec.start();
      recRef.current = rec;
      setMicOn(true);
    } catch {
      recRef.current = null;
    }
  };

  const close = () => {
    setOpen(false);
    recRef.current?.stop();
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
  };

  return (
    <>
      {!open && (
        <button id="ask-launch" data-track="assistant_opened" aria-label={translate("Open ASK-ANKIT assistant")} onClick={() => setOpen(true)}>
          <span className="orb">
            <Image src={assistantAvatar} alt="" width={52} height={52} />
            <span className="bubble">
              <i />
              <i />
              <i />
            </span>
            <span className="dot" />
          </span>
        </button>
      )}

      <div id="ask" className={open ? "open" : undefined} role="dialog" aria-label={translate("ASK-ANKIT assistant")}>
        <div className="hd">
          <span className="avatar">
            <Image src={assistantAvatar} alt="" width={20} height={20} />
          </span>
          <span className="nm">ASK-ANKIT</span>
          <span className="sp">
            <button aria-pressed={voiceOn} onClick={() => setVoiceOn((v) => !v)}>{translate(voiceOn ? "voice on" : "voice off")}</button>
            <button className="x" aria-label={translate("Close")} onClick={close}>
              <X size={16} />
            </button>
          </span>
        </div>
        <div className="bd" ref={bodyRef}>
          <div className="intro">{translate("Runs on my CV, projects and consulting work. Ask anything — or hit the mic.")}</div>
          {chat.map((m, i) => (
            <div className={`m${m.role === "user" ? " you" : ""}`} key={i}>
              <span className="who">{m.role === "user" ? translate("YOU") : "ANKIT"}</span>
              <span className="tx">{m.content}</span>
            </div>
          ))}
          {thinking && (
            <div className="m">
              <span className="who">ANKIT</span>
              <span className="think">
                {translate("thinking")}<span className="blink">…</span>
              </span>
            </div>
          )}
        </div>
        {chat.length === 0 && (
          <div className="sugg">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => ask(translate(s))}>
                {translate(s)}
              </button>
            ))}
          </div>
        )}
        <div className="rule" />
        <div className="in">
          <span className="p">&gt;</span>
          <input
            placeholder={translate("ask me anything…")}
            autoComplete="off"
            spellCheck={false}
            aria-label={translate("Ask a question")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                ask(input);
              }
            }}
          />
          <button className={`mic${micOn ? " on" : ""}`} aria-pressed={micOn} aria-label={translate("Voice input")} title={translate("Voice input")} onClick={toggleMic}>
            <Mic size={18} />
          </button>
          <button className="send" onClick={() => ask(input)}>
            {translate("send")}
          </button>
        </div>
      </div>
    </>
  );
});

export default AskAnkit;
