import { Component } from "react";
import { Card, Page } from "./ui.jsx";

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
        <Page narrow>
          <Card className="fp-alert--error" style={{ borderColor: "var(--fp-danger-border)" }}>
            <h2 className="fp-card-title" style={{ color: "var(--fp-danger)" }}>
              Sayfa yüklenemedi
            </h2>
            <p className="fp-card-desc">
              Uygulama beklenmeyen bir hatayla durdu. Sayfayı yenileyin; sorun sürerse geliştiriciye bu metni iletin.
            </p>
            <pre
              style={{
                fontSize: 12,
                overflow: "auto",
                padding: 12,
                background: "var(--fp-bg)",
                borderRadius: "var(--fp-radius)",
                marginTop: 12
              }}
            >
              {this.state.error?.message || String(this.state.error)}
            </pre>
          </Card>
        </Page>
      );
    }
    return this.props.children;
  }
}
