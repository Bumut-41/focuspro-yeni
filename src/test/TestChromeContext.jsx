import { createContext, useContext, useMemo, useState } from "react";

const TestChromeContext = createContext(null);

export function TestChromeProvider({ children }) {
  const [immersive, setImmersive] = useState(false);
  const value = useMemo(() => ({ immersive, setImmersive }), [immersive]);
  return <TestChromeContext.Provider value={value}>{children}</TestChromeContext.Provider>;
}

export function useTestChrome() {
  const ctx = useContext(TestChromeContext);
  if (!ctx) throw new Error("useTestChrome must be used within TestChromeProvider");
  return ctx;
}
