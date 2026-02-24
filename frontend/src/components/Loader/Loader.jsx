import React from "react";
import "./Loader.css";

const Loader = () => {
  return (
    <div className="loader-container">
      {/* Ambient coffee beans background */}
      <div className="ambient-beans">
        <span className="bean bean-1">☕</span>
        <span className="bean bean-2">☕</span>
        <span className="bean bean-3">☕</span>
      </div>

      {/* Main loader */}
      <div className="coffee-loader">
        {/* Coffee drops falling */}
        <div className="coffee-drops">
          <div className="drop drop-1"></div>
          <div className="drop drop-2"></div>
          <div className="drop drop-3"></div>
        </div>

        {/* Steam rising */}
        <div className="steam-container">
          <div className="steam steam-1"></div>
          <div className="steam steam-2"></div>
          <div className="steam steam-3"></div>
          <div className="steam steam-4"></div>
        </div>

        {/* Coffee cup */}
        <div className="coffee-cup">
          <div className="cup-body">
            <div className="cup-shine"></div>
            <div className="coffee-liquid">
              <div className="coffee-wave"></div>
              <div className="coffee-wave wave-2"></div>
              <div className="splash"></div>
            </div>
          </div>
          <div className="cup-handle"></div>
        </div>

        {/* Saucer/Plate */}
        <div className="cup-plate">
          <div className="plate-shine"></div>
        </div>
      </div>

      {/* Brand text */}
      <div className="loader-text">
        <h1 className="brand-name">
          <span className="brew">Brew</span>
          <span className="haven">Haven</span>
        </h1>
        <p className="tagline">Crafting your experience</p>
      </div>
    </div>
  );
};

export default Loader;
