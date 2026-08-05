import React from "react";
import "./Loader.css";

const Loader = () => {
  return (
    <div className="cafe-loader-container">
      <div className="espresso-loader">
        <div className="outer-ring"></div>
        <div className="inner-coffee"></div>
        <div className="steam steam-1"></div>
        <div className="steam steam-2"></div>
      </div>

      <div className="loader-brand">
        <h1>
          <span className="brew">Brew</span>{" "}
          <span className="haven">Haven</span>
        </h1>
        <p>Preparing your fresh experience</p>
      </div>
    </div>
  );
};

export default Loader;
