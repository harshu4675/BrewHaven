import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "./styles/index.css";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);

// ===== SERVICE WORKER - PRODUCTION ONLY WITH WORKBOX =====
if (process.env.NODE_ENV === "production") {
  serviceWorkerRegistration.register({
    onSuccess: (registration) => {
      console.log("✅ Content cached for offline use.");
      console.log("✅ Service Worker registered:", registration.scope);
    },
    onUpdate: (registration) => {
      console.log("🔄 New content available; please refresh.");
      window.dispatchEvent(new Event("sw-update-available"));

      // Optionally auto-update
      if (registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
        window.location.reload();
      }
    },
  });
} else {
  console.log("ℹ️ Service Worker disabled in development mode");
}

// ===== PWA INSTALL PROMPT =====
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log("💡 PWA Install prompt is ready");
  window.dispatchEvent(new Event("pwa-installable"));
});

window.addEventListener("appinstalled", () => {
  console.log("🎉 PWA installed successfully!");
  deferredPrompt = null;
  window.dispatchEvent(new Event("pwa-installed"));
});

window.installPWA = async () => {
  if (!deferredPrompt) {
    console.log("⚠️ Install prompt not available");
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`User response: ${outcome}`);
  deferredPrompt = null;
  return outcome === "accepted";
};

// ===== OFFLINE DETECTION =====
window.addEventListener("online", () => {
  console.log("🌐 Back online");
  document.body.classList.remove("offline");
  window.dispatchEvent(new Event("connection-online"));
});

window.addEventListener("offline", () => {
  console.log("📡 Offline mode");
  document.body.classList.add("offline");
  window.dispatchEvent(new Event("connection-offline"));
});

// ===== APP INFO =====
console.log(
  "%c🍕 Brew Haven Cafe v1.0.0",
  "color: #d4145a; font-size: 16px; font-weight: bold;",
);
console.log(
  `%cMode: ${process.env.NODE_ENV}`,
  "color: #16a34a; font-size: 12px;",
);

if (window.matchMedia("(display-mode: standalone)").matches) {
  console.log(
    "%c📱 Running as installed PWA",
    "color: #0ea5e9; font-size: 12px;",
  );
  document.body.classList.add("pwa-mode");
}
