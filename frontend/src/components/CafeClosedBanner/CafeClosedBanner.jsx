import React from "react";
import { FiAlertCircle } from "react-icons/fi";
import { useApp } from "../../context/AppContext";

const CafeClosedBanner = () => {
  const { isCafeOpen, settings } = useApp();

  if (isCafeOpen) return null;

  return (
    <div className="cafe-closed-banner">
      <FiAlertCircle className="icon" />
      <p>
        {settings.cafeMessage ||
          "The café is currently closed. Please check back later!"}
      </p>
    </div>
  );
};

export default CafeClosedBanner;
