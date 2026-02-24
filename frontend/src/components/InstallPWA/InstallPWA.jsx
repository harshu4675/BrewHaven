import React, { useState, useEffect } from "react";
import { FaDownload, FaTimes, FaMobileAlt } from "react-icons/fa";
import "./InstallPWA.css";

const InstallPWA = () => {
  const [showInstall, setShowInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    const isInWebAppiOS = window.navigator.standalone === true;

    if (isStandalone || isInWebAppiOS) {
      console.log("✅ App is already installed");
      return;
    }

    // Check if user dismissed recently (changed to 1 day)
    const dismissedTime = localStorage.getItem("pwa-install-dismissed");
    if (dismissedTime) {
      const hoursSinceDismiss =
        (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60);
      if (hoursSinceDismiss < 24) {
        // 24 hours instead of 7 days
        console.log("ℹ️ Install prompt dismissed recently");
        return;
      }
    }

    // Check if iOS
    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Listen for installable event
    const handleInstallable = () => {
      console.log("💡 Install prompt ready");
      setShowInstall(true);
    };

    const handleInstalled = () => {
      console.log("✅ App installed");
      setShowInstall(false);
      localStorage.removeItem("pwa-install-dismissed");
    };

    window.addEventListener("pwa-installable", handleInstallable);
    window.addEventListener("pwa-installed", handleInstalled);

    // ALWAYS show banner after 2 seconds (for testing)
    const timer = setTimeout(() => {
      console.log("⏰ Showing install banner");
      setShowInstall(true);
    }, 2000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("pwa-installable", handleInstallable);
      window.removeEventListener("pwa-installed", handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (typeof window.installPWA === "function") {
      const result = await window.installPWA();
      if (result) {
        setShowInstall(false);
        localStorage.setItem("pwa-install-dismissed", Date.now().toString());
      }
    } else {
      console.log("⚠️ Install function not available - showing instructions");
      setShowIOSInstructions(true);
    }
  };

  const handleDismiss = () => {
    setShowInstall(false);
    setShowIOSInstructions(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  if (!showInstall) return null;

  if (showIOSInstructions) {
    return (
      <div className="install-pwa-modal-overlay" onClick={handleDismiss}>
        <div className="install-pwa-modal" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={handleDismiss}>
            <FaTimes />
          </button>

          <div className="modal-header">
            <FaMobileAlt className="modal-icon" />
            <h3>Install Tasty Bites</h3>
          </div>

          <div className="modal-body">
            <p className="modal-desc">To install this app on your device:</p>

            <ol className="install-steps">
              <li>
                <span className="step-number">1</span>
                <span>
                  Tap the <strong>Share</strong> button
                  <svg
                    width="16"
                    height="20"
                    viewBox="0 0 16 20"
                    fill="currentColor"
                    style={{ margin: "0 5px", verticalAlign: "middle" }}
                  >
                    <path d="M8 0L10.5 2.5L9 4L8 3V11H6V3L5 4L3.5 2.5L8 0ZM0 8V18C0 19.1 0.9 20 2 20H14C15.1 20 16 19.1 16 18V8H14V18H2V8H0Z" />
                  </svg>
                  (iOS Safari) or <strong>Menu ⋮</strong> (Android Chrome)
                </span>
              </li>
              <li>
                <span className="step-number">2</span>
                <span>
                  Scroll and tap <strong>"Add to Home Screen"</strong>
                </span>
              </li>
              <li>
                <span className="step-number">3</span>
                <span>
                  Tap <strong>"Add"</strong> to confirm
                </span>
              </li>
            </ol>

            <div className="modal-footer">
              <button className="modal-got-it-btn" onClick={handleDismiss}>
                Got it!
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="install-pwa-banner">
      <div className="install-content">
        <div className="install-icon">
          <FaDownload />
        </div>
        <div className="install-text">
          <h4>Install Tasty Bites</h4>
          <p>Get the app for faster access & offline use</p>
        </div>
      </div>
      <div className="install-actions">
        <button className="install-btn" onClick={handleInstall}>
          {isIOS ? "How to Install" : "Install"}
        </button>
        <button className="dismiss-btn" onClick={handleDismiss} title="Dismiss">
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default InstallPWA;
