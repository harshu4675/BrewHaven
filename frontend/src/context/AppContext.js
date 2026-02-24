import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { adminAPI, ordersAPI } from "../services/api";

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    cafeOpen: true,
    taxRate: 18,
    openTime: "10:00",
    closeTime: "22:00",
    orderType: "pickup",
    pickupMessage: "Please pick up your order from the counter.",
    closedMessage: "Sorry, we are currently closed.",
  });
  const [shopStatus, setShopStatus] = useState({
    isOpen: true,
    openTime: "10:00",
    closeTime: "22:00",
  });
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchShopStatus();

    // Refresh shop status every minute
    const interval = setInterval(fetchShopStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminAPI.getSettings();
      setSettings(response.data);
    } catch (err) {
      console.error("Failed to fetch settings");
    }
  };

  const fetchShopStatus = async () => {
    try {
      const response = await ordersAPI.getShopStatus();
      setShopStatus(response.data);
    } catch (err) {
      console.error("Failed to fetch shop status");
    }
  };

  const showAlert = useCallback((type, title, message) => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, 5000);
  }, []);

  const hideAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const value = {
    settings,
    setSettings,
    fetchSettings,
    shopStatus,
    fetchShopStatus,
    alerts,
    showAlert,
    hideAlert,
    loading,
    setLoading,
    isCafeOpen: shopStatus.isOpen,
    taxRate: settings.taxRate || 18,
    orderType: settings.orderType || "pickup",
    pickupMessage: settings.pickupMessage,
    closedMessage: settings.closedMessage,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
