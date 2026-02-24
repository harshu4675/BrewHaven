import React, { useState, useEffect } from "react";
import { FiClock, FiAlertCircle, FiMapPin, FiX } from "react-icons/fi";
import { ordersAPI } from "../../services/api";
import "./ShopStatus.css";

const ShopStatus = () => {
  const [shopStatus, setShopStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchShopStatus();
    const interval = setInterval(fetchShopStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchShopStatus = async () => {
    try {
      const response = await ordersAPI.getShopStatus();
      setShopStatus(response.data);
    } catch (error) {
      console.error("Failed to fetch shop status");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  if (loading || !shopStatus || dismissed) return null;

  const getMessage = () => {
    if (!shopStatus.isOpen) {
      return {
        type: "closed",
        icon: <FiAlertCircle />,
        text:
          shopStatus.closedMessage ||
          `We're Currently Closed • Open ${formatTime(shopStatus.openTime)} - ${formatTime(shopStatus.closeTime)}`,
      };
    }
    if (shopStatus.orderType === "pickup") {
      return {
        type: "pickup",
        icon: <FiMapPin />,
        text: `Counter Pickup Only • ${shopStatus.pickupMessage || "Orders available for pickup at counter"}`,
      };
    }
    return {
      type: "open",
      icon: <FiClock />,
      text: `We're Open! • Serving until ${formatTime(shopStatus.closeTime)} • Order Now & Enjoy Fresh Coffee ☕`,
    };
  };

  const status = getMessage();

  return (
    <div className={`shop-status-ticker ${status.type}`}>
      <div className="ticker-wrapper">
        <div className="ticker-content">
          {/* Repeat content for seamless loop */}
          {[...Array(4)].map((_, index) => (
            <div key={index} className="ticker-item">
              <span className="status-dot"></span>
              <span className="status-icon">{status.icon}</span>
              <span className="status-text">{status.text}</span>
              <span className="ticker-separator">✦</span>
            </div>
          ))}
        </div>
      </div>
      <button className="ticker-dismiss" onClick={() => setDismissed(true)}>
        <FiX />
      </button>
    </div>
  );
};

export default ShopStatus;
