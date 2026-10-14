import { useEffect, useState } from "react";

function detectTouchTest() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const noHover = window.matchMedia("(hover: none)").matches;
  const touchPoints = navigator.maxTouchPoints || 0;
  return coarse || (noHover && touchPoints > 0);
}

export function useTouchTest() {
  const [touchTest, setTouchTest] = useState(detectTouchTest);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)");
    const hoverNone = window.matchMedia("(hover: none)");
    const update = () => setTouchTest(detectTouchTest());
    coarse.addEventListener("change", update);
    hoverNone.addEventListener("change", update);
    update();
    return () => {
      coarse.removeEventListener("change", update);
      hoverNone.removeEventListener("change", update);
    };
  }, []);

  return touchTest;
}
