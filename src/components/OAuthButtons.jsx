import { useState } from "react";
import { signInWithProvider } from "../lib/oauth.js";
import { btnGhost } from "./ui.js";

const providers = [
  { id: "google", label: "Google ile devam et" },
  { id: "azure", label: "Microsoft ile devam et" },
  { id: "apple", label: "Apple ile devam et" }
];

export function OAuthButtons() {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState("");

  async function go(provider) {
    setMsg("");
    setBusy(provider);
    try {
      await signInWithProvider(provider);
    } catch (e) {
      setMsg(e.message || "Giriş başlatılamadı. Supabase’te bu sağlayıcı açık mı kontrol edin.");
      setBusy("");
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ textAlign: "center", color: "#64748b", fontSize: 14, margin: "16px 0 12px" }}>veya</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {providers.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={!!busy}
            onClick={() => go(p.id)}
            style={{ ...btnGhost, width: "100%", fontWeight: 600 }}
          >
            {busy === p.id ? "Yönlendiriliyor…" : p.label}
          </button>
        ))}
      </div>
      {msg && <p style={{ color: "#b91c1c", marginTop: 12, fontSize: 14 }}>{msg}</p>}
      <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 10, lineHeight: 1.4 }}>
        İlk kez Google/Microsoft/Apple ile girerseniz kısa bir profil formu (18 yaş, hesap türü) sorulur.
      </p>
    </div>
  );
}
