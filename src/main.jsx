import React from "react";
import ReactDOM from "react-dom/client";
import "./chartRegister.js";
import App from "./App.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import { reloadStaleChunk } from "./lib/reloadStaleChunk.js";
import "./index.css";

window.addEventListener("vite:preloadError", (event) => {
  if (reloadStaleChunk(event.payload)) event.preventDefault();
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
