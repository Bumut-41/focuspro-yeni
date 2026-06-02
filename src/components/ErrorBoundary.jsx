import { Component } from "react";

export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("FocusProLab render hatası:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ maxWidth: 520, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 12, border: "1px solid #fecaca" }}>
          <h2 style={{ marginTop: 0, color: "#b91c1c" }}>Sayfa yüklenemedi</h2>
          <p style={{ color: "#475569", lineHeight: 1.5 }}>
            Uygulama beklenmeyen bir hatayla durdu. Sayfayı yenileyin; sorun sürerse geliştiriciye bu metni iletin.
          </p>
          <pre style={{ fontSize: 12, overflow: "auto", padding: 12, background: "#f8fafc", borderRadius: 8 }}>
            {this.state.error?.message || String(this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
