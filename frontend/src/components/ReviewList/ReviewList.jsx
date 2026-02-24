import React, { useState } from "react";
import StarRating from "../StarRating/StarRating";
import { useAuth } from "../../context/AuthContext";
import "./ReviewList.css";

const ReviewList = ({ reviews, onEdit, onDelete, onMarkHelpful }) => {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredReviews = reviews.filter((review) => {
    if (filter === "all") return true;
    if (filter === "5") return review.rating === 5;
    if (filter === "4") return review.rating === 4;
    if (filter === "3") return review.rating === 3;
    if (filter === "2") return review.rating === 2;
    if (filter === "1") return review.rating === 1;
    return true;
  });

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((review) => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  const distribution = getRatingDistribution();
  const totalReviews = reviews.length;

  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews || 0;

  return (
    <div className="review-list-container">
      <div className="reviews-header">
        <h3>Customer Reviews</h3>
        {totalReviews > 0 && (
          <div className="reviews-summary">
            <div className="average-rating">
              <div className="rating-number">{averageRating.toFixed(1)}</div>
              <StarRating rating={averageRating} size="large" />
              <p>
                {totalReviews} review{totalReviews !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="distribution-row">
                  <span className="star-label">{star} ★</span>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(distribution[star] / totalReviews) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="count">{distribution[star]}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {totalReviews > 0 && (
        <div className="reviews-filter">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All ({totalReviews})
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              className={filter === String(star) ? "active" : ""}
              onClick={() => setFilter(String(star))}
            >
              {star} ★ ({distribution[star]})
            </button>
          ))}
        </div>
      )}

      <div className="reviews-list">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div key={review._id} className="review-item">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4>{review.user?.name}</h4>
                    <div className="review-meta">
                      <StarRating rating={review.rating} size="small" />
                      <span className="review-date">
                        {formatDate(review.createdAt)}
                      </span>
                      {review.isVerifiedPurchase && (
                        <span className="verified-badge">
                          ✓ Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {user?._id === review.user?._id && (
                  <div className="review-actions">
                    <button
                      className="action-btn edit"
                      onClick={() => onEdit(review)}
                      title="Edit Review"
                    >
                      Edit
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => onDelete(review._id)}
                      title="Delete Review"
                    >
                      Del
                    </button>
                  </div>
                )}
              </div>

              <div className="review-content">
                <h5>{review.title}</h5>
                <p>{review.comment}</p>
              </div>

              <div className="review-footer">
                <button
                  className={`helpful-btn ${
                    review.helpfulBy?.includes(user?._id) ? "marked" : ""
                  }`}
                  onClick={() => onMarkHelpful(review._id)}
                  disabled={!user}
                >
                  👍 Helpful ({review.helpfulCount || 0})
                </button>
              </div>

              {review.adminResponse && (
                <div className="admin-response">
                  <div className="response-header">
                    <strong>Response from Brew Haven</strong>
                    <span className="response-date">
                      {formatDate(review.adminResponse.respondedAt)}
                    </span>
                  </div>
                  <p>{review.adminResponse.message}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-reviews">
            <p>No reviews found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewList;
