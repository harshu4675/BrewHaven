import React from "react";
import {
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiInfo,
  FiX,
} from "react-icons/fi";
import { useApp } from "../../context/AppContext";
import "./Alert.css";

const Alert = () => {
  const { alerts, hideAlert } = useApp();

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <FiCheckCircle />;
      case "error":
        return <FiXCircle />;
      case "warning":
        return <FiAlertTriangle />;
      default:
        return <FiInfo />;
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="alert-container">
      {alerts.map((alert) => (
        <div key={alert.id} className={`alert alert-${alert.type}`}>
          <span className="alert-icon">{getIcon(alert.type)}</span>
          <div className="alert-content">
            <h4 className="alert-title">{alert.title}</h4>
            <p className="alert-message">{alert.message}</p>
          </div>
          <button className="alert-close" onClick={() => hideAlert(alert.id)}>
            <FiX />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Alert;
