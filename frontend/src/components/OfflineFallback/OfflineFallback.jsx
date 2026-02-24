import React from "react";
import { FaWifi } from "react-icons/fa";
import "./OfflineFallback.css";

const OfflineFallback = () => {
  return (
    <div className="offline-banner">
      <div className="offline-content">
        <FaWifi className="offline-icon" />
        <span className="offline-text">
          You're offline. Some features may be limited.
        </span>
      </div>
      <div className="offline-pulse"></div>
    </div>
  );
};

export default OfflineFallback;
