import { useEffect, useState } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Types out each heading in `heads`, pausing, then deleting and cycling to the next. */
export function useTypewriter(heads: readonly string[]) {
  const sequence = JSON.stringify(heads);
  const [frame, setFrame] = useState({
    sequence,
    text: "",
    phrase: heads[0] ?? "",
  });

  useEffect(() => {
    const phrases: string[] = JSON.parse(sequence);
    const motion = window.matchMedia(REDUCED_MOTION_QUERY);
    let phraseIndex = 0;
    let characterIndex = 0;
    let deleting = false;
    let animation = 0;
    let previous = 0;
    let budget = 0;
    let delay = 320;

    const tick = (time: number) => {
      if (motion.matches || phrases.length === 0) {
        setFrame({
          sequence,
          text: phrases[0] ?? "",
          phrase: phrases[0] ?? "",
        });
        return;
      }
      if (previous && !document.hidden) budget += Math.min(time - previous, 80);
      previous = time;
      while (budget >= delay) {
        budget -= delay;
        const full = phrases[phraseIndex];
        if (!deleting) {
          characterIndex++;
          delay = full[characterIndex - 1] === "\n" ? 220 : 42;
          if (characterIndex >= full.length) {
            deleting = true;
            delay = 2800;
          }
        } else if (characterIndex > 0) {
          characterIndex--;
          delay = 24;
        } else {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
          delay = 380;
        }
        const phrase = phrases[phraseIndex];
        setFrame({ sequence, text: phrase.slice(0, characterIndex), phrase });
      }
      animation = requestAnimationFrame(tick);
    };

    const restart = () => {
      cancelAnimationFrame(animation);
      phraseIndex = 0;
      characterIndex = 0;
      deleting = false;
      previous = 0;
      budget = 0;
      delay = 320;
      animation = requestAnimationFrame(tick);
    };
    motion.addEventListener("change", restart);
    animation = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animation);
      motion.removeEventListener("change", restart);
    };
  }, [sequence]);

  return frame.sequence === sequence
    ? frame
    : { text: "", phrase: heads[0] ?? "" };
}
