import React from "react";
import { FiStar } from "react-icons/fi";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";
import "./StarRating.css";

const StarRating = ({
  rating,
  size = "medium",
  interactive = false,
  onRate,
}) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  const handleClick = (index) => {
    if (interactive && onRate) {
      onRate(index + 1);
    }
  };

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <FaStar
          key={i}
          className={`star filled ${interactive ? "interactive" : ""}`}
          onClick={() => handleClick(i)}
        />,
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <FaStarHalfAlt
          key={i}
          className={`star half ${interactive ? "interactive" : ""}`}
          onClick={() => handleClick(i)}
        />,
      );
    } else {
      stars.push(
        <FiStar
          key={i}
          className={`star empty ${interactive ? "interactive" : ""}`}
          onClick={() => handleClick(i)}
        />,
      );
    }
  }

  return <div className={`star-rating ${size}`}>{stars}</div>;
};

export default StarRating;
