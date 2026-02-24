import React, { useState, useEffect } from "react";
import {
  FiStar,
  FiX,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiCoffee,
  FiThumbsUp,
} from "react-icons/fi";
import { reviewsAPI } from "../../services/api";
import Modal from "../Modal/Modal";
import "./OrderReviewPrompt.css";

const OrderReviewPrompt = ({ isOpen, onClose, onComplete }) => {
  const [reviewableOrders, setReviewableOrders] = useState([]);
  const [currentOrderIndex, setCurrentOrderIndex] = useState(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState("products"); // 'products', 'service', 'complete'
  const [error, setError] = useState(null);

  // Review data for current product
  const [productReview, setProductReview] = useState({
    rating: 0,
    title: "",
    comment: "",
  });

  // Service rating
  const [serviceRating, setServiceRating] = useState({
    overall: 0,
    delivery: 0,
    packaging: 0,
    comment: "",
  });

  // All reviews for current order
  const [orderReviews, setOrderReviews] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchReviewableOrders();
    }
  }, [isOpen]);

  const fetchReviewableOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await reviewsAPI.getReviewableOrders();
      console.log("Reviewable orders:", response.data);

      setReviewableOrders(response.data || []);

      if (response.data && response.data.length > 0) {
        setCurrentOrderIndex(0);
        setCurrentItemIndex(0);
        resetProductReview();
      }
    } catch (err) {
      console.error("Failed to fetch reviewable orders:", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetProductReview = () => {
    setProductReview({
      rating: 0,
      title: "",
      comment: "",
    });
  };

  const currentOrder = reviewableOrders[currentOrderIndex];
  const reviewableItems = currentOrder?.items || [];
  const currentItem = reviewableItems[currentItemIndex];
  const totalItems = reviewableItems.length;

  const handleStarClick = (rating) => {
    setProductReview({ ...productReview, rating });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductReview({ ...productReview, [name]: value });
  };

  const handleServiceRatingChange = (field, value) => {
    setServiceRating({ ...serviceRating, [field]: value });
  };

  const handleSubmitProductReview = () => {
    if (productReview.rating === 0) {
      return;
    }

    // Get product ID correctly
    const productId = currentItem.product?._id || currentItem.product;
    const productName = currentItem.product?.name || currentItem.name;

    // Add to order reviews
    const newReview = {
      productId: productId,
      productName: productName,
      ...productReview,
    };

    setOrderReviews([...orderReviews, newReview]);

    // Move to next item or service rating
    if (currentItemIndex < totalItems - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
      resetProductReview();
    } else {
      setStep("service");
    }
  };

  const handleSkipProduct = () => {
    if (currentItemIndex < totalItems - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
      resetProductReview();
    } else {
      if (orderReviews.length > 0) {
        setStep("service");
      } else {
        handleSkipOrder();
      }
    }
  };

  const handleSkipOrder = () => {
    if (currentOrderIndex < reviewableOrders.length - 1) {
      setCurrentOrderIndex(currentOrderIndex + 1);
      setCurrentItemIndex(0);
      setOrderReviews([]);
      setStep("products");
      resetProductReview();
      setServiceRating({ overall: 0, delivery: 0, packaging: 0, comment: "" });
    } else {
      onClose();
    }
  };

  const handleSubmitAllReviews = async () => {
    if (orderReviews.length === 0) {
      handleSkipOrder();
      return;
    }

    setSubmitting(true);

    try {
      // Format reviews for API
      const reviewsToSubmit = orderReviews.map((review) => ({
        productId: review.productId,
        rating: review.rating,
        title: review.title || `Great ${review.productName}!`,
        comment: review.comment || "Loved it!",
      }));

      console.log("Submitting reviews:", {
        orderId: currentOrder._id,
        reviews: reviewsToSubmit,
      });

      // Submit all reviews
      await reviewsAPI.bulkReview({
        orderId: currentOrder._id,
        reviews: reviewsToSubmit,
        serviceRating: serviceRating.overall > 0 ? serviceRating : null,
      });

      setStep("complete");

      // After showing completion, move to next order or close
      setTimeout(() => {
        if (currentOrderIndex < reviewableOrders.length - 1) {
          setCurrentOrderIndex(currentOrderIndex + 1);
          setCurrentItemIndex(0);
          setOrderReviews([]);
          setStep("products");
          resetProductReview();
          setServiceRating({
            overall: 0,
            delivery: 0,
            packaging: 0,
            comment: "",
          });
        } else {
          onComplete?.();
          onClose();
        }
      }, 2000);
    } catch (err) {
      console.error("Failed to submit reviews:", err);
      setError("Failed to submit reviews. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (currentRating, onChange, size = "large") => {
    return (
      <div className={`star-rating-input ${size}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-btn ${star <= currentRating ? "filled" : ""}`}
            onClick={() => onChange(star)}
          >
            <FiStar />
          </button>
        ))}
      </div>
    );
  };

  const getRatingLabel = (rating) => {
    const labels = {
      1: "Poor",
      2: "Fair",
      3: "Good",
      4: "Very Good",
      5: "Excellent",
    };
    return labels[rating] || "Select Rating";
  };

  const getProductImage = (item) => {
    return (
      item?.product?.image ||
      item?.image ||
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200"
    );
  };

  const getProductName = (item) => {
    return item?.product?.name || item?.name || "Product";
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} width="600px">
      <div className="order-review-prompt">
        {/* Loading State */}
        {loading && (
          <div className="review-prompt-loading">
            <div className="spinner"></div>
            <p>Loading your orders...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="review-prompt-error">
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchReviewableOrders}>
              Try Again
            </button>
            <button className="btn btn-outline" onClick={onClose}>
              Close
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && reviewableOrders.length === 0 && (
          <div className="review-prompt-empty">
            <FiCheck className="success-icon" />
            <h3>All caught up!</h3>
            <p>You've reviewed all your delivered orders.</p>
            <button className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        )}

        {/* Complete State */}
        {!loading && step === "complete" && (
          <div className="review-prompt-complete">
            <div className="success-animation">
              <FiThumbsUp className="success-icon" />
            </div>
            <h3>Thank You! 🎉</h3>
            <p>Your review has been submitted successfully.</p>
            <p className="sub-text">Your feedback helps us improve!</p>
          </div>
        )}

        {/* Service Rating Step */}
        {!loading &&
          !error &&
          reviewableOrders.length > 0 &&
          step === "service" && (
            <div className="review-prompt-service">
              <div className="review-header">
                <FiCoffee className="header-icon" />
                <h3>Rate Your Experience</h3>
                <p>How was your overall experience with this order?</p>
              </div>

              <div className="service-ratings">
                <div className="service-rating-item">
                  <label>Overall Experience</label>
                  {renderStars(serviceRating.overall, (val) =>
                    handleServiceRatingChange("overall", val),
                  )}
                  <span className="rating-label">
                    {getRatingLabel(serviceRating.overall)}
                  </span>
                </div>

                <div className="service-rating-item">
                  <label>Delivery/Pickup</label>
                  {renderStars(
                    serviceRating.delivery,
                    (val) => handleServiceRatingChange("delivery", val),
                    "medium",
                  )}
                </div>

                <div className="service-rating-item">
                  <label>Packaging Quality</label>
                  {renderStars(
                    serviceRating.packaging,
                    (val) => handleServiceRatingChange("packaging", val),
                    "medium",
                  )}
                </div>

                <div className="service-comment">
                  <label>Any additional feedback? (Optional)</label>
                  <textarea
                    value={serviceRating.comment}
                    onChange={(e) =>
                      handleServiceRatingChange("comment", e.target.value)
                    }
                    placeholder="Tell us about your experience..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="review-summary">
                <h4>Review Summary</h4>
                <div className="reviewed-items">
                  {orderReviews.map((review, idx) => (
                    <div key={idx} className="reviewed-item">
                      <span>{review.productName}</span>
                      <div className="stars-display">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FiStar
                            key={star}
                            className={star <= review.rating ? "filled" : ""}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="review-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => setStep("products")}
                >
                  <FiChevronLeft /> Back
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmitAllReviews}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </div>
          )}

        {/* Product Rating Step */}
        {!loading &&
          !error &&
          reviewableOrders.length > 0 &&
          step === "products" &&
          currentItem && (
            <div className="review-prompt-product">
              {/* Header */}
              <div className="review-header">
                <div className="order-badge">
                  Order #{currentOrder?._id?.slice(-8).toUpperCase()}
                </div>
                <button className="close-btn" onClick={onClose}>
                  <FiX />
                </button>
              </div>

              {/* Progress */}
              <div className="review-progress">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${((currentItemIndex + 1) / totalItems) * 100}%`,
                    }}
                  />
                </div>
                <span>
                  Item {currentItemIndex + 1} of {totalItems}
                </span>
              </div>

              {/* Current Product */}
              <div className="review-product">
                <div className="product-image">
                  <img
                    src={getProductImage(currentItem)}
                    alt={getProductName(currentItem)}
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200";
                    }}
                  />
                </div>
                <h4>{getProductName(currentItem)}</h4>
                <p className="product-qty">
                  Quantity: {currentItem.quantity || 1}
                </p>
              </div>

              {/* Rating */}
              <div className="rating-section">
                <label>How would you rate this item?</label>
                {renderStars(productReview.rating, handleStarClick)}
                <span className="rating-label">
                  {getRatingLabel(productReview.rating)}
                </span>
              </div>

              {/* Review Form (shows after rating) */}
              {productReview.rating > 0 && (
                <div className="review-form-section">
                  <div className="form-group">
                    <label>Review Title (Optional)</label>
                    <input
                      type="text"
                      name="title"
                      value={productReview.title}
                      onChange={handleInputChange}
                      placeholder="Summarize your experience"
                      maxLength={100}
                    />
                  </div>

                  <div className="form-group">
                    <label>Your Review (Optional)</label>
                    <textarea
                      name="comment"
                      value={productReview.comment}
                      onChange={handleInputChange}
                      placeholder="What did you like or dislike?"
                      rows={3}
                      maxLength={500}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="review-actions">
                <button className="btn btn-text" onClick={handleSkipProduct}>
                  Skip this item
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmitProductReview}
                  disabled={productReview.rating === 0}
                >
                  {currentItemIndex < totalItems - 1 ? (
                    <>
                      Next Item <FiChevronRight />
                    </>
                  ) : (
                    <>
                      Continue <FiChevronRight />
                    </>
                  )}
                </button>
              </div>

              {/* Skip Order Option */}
              {reviewableOrders.length > 1 && (
                <div className="skip-order">
                  <button onClick={handleSkipOrder}>
                    Skip this order (
                    {reviewableOrders.length - currentOrderIndex - 1} more)
                  </button>
                </div>
              )}
            </div>
          )}
      </div>
    </Modal>
  );
};

export default OrderReviewPrompt;
