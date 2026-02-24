import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FiCheck,
  FiStar,
  FiShoppingBag,
  FiHome,
  FiDownload,
} from "react-icons/fi";
import { ordersAPI, reviewsAPI } from "../../services/api";
import { useApp } from "../../context/AppContext";
import StarRating from "../../components/StarRating/StarRating";
import Modal from "../../components/Modal/Modal";
import Invoice from "../../components/Invoice/Invoice";
import "./OrderSuccess.css";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showAlert } = useApp();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQuickReview, setShowQuickReview] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quickRating, setQuickRating] = useState(0);
  const [quickReviewSubmitting, setQuickReviewSubmitting] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  const orderId = location.state?.orderId;

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      navigate("/dashboard");
    }
  }, [orderId, navigate]);

  const fetchOrder = async () => {
    try {
      const response = await ordersAPI.getById(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRate = (item) => {
    setSelectedItem(item);
    setQuickRating(0);
    setShowQuickReview(true);
  };

  const submitQuickReview = async () => {
    if (quickRating === 0) {
      showAlert("warning", "Select Rating", "Please select a rating");
      return;
    }

    setQuickReviewSubmitting(true);
    try {
      await reviewsAPI.create({
        productId: selectedItem.product,
        orderId: orderId,
        rating: quickRating,
        title: `Quick review - ${quickRating} stars`,
        comment: getRatingMessage(quickRating),
      });
      showAlert("success", "Thank You!", "Your rating has been submitted");
      setShowQuickReview(false);
      setSelectedItem(null);
    } catch (error) {
      if (error.response?.data?.message?.includes("already reviewed")) {
        showAlert(
          "info",
          "Already Reviewed",
          "You have already reviewed this product",
        );
      } else {
        showAlert("error", "Error", "Failed to submit review");
      }
    } finally {
      setQuickReviewSubmitting(false);
    }
  };

  const getRatingMessage = (rating) => {
    switch (rating) {
      case 5:
        return "Excellent! Absolutely loved it!";
      case 4:
        return "Great product, very satisfied!";
      case 3:
        return "Good product, met expectations.";
      case 2:
        return "Could be better, not fully satisfied.";
      case 1:
        return "Not satisfied with the product.";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="order-success-page page">
        <div className="container">
          <div className="loading-state">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-page page">
      <div className="container">
        <div className="success-container">
          {/* Success Icon */}
          <div className="success-icon-wrapper">
            <div className="success-icon">
              <FiCheck />
            </div>
            <div className="success-confetti">🎉</div>
          </div>

          {/* Success Message */}
          <h1>Order Placed Successfully!</h1>
          <p className="success-subtitle">
            Thank you for your order. We're preparing your items with love!
          </p>

          {order && (
            <>
              {/* Order Info */}
              <div className="order-info-card">
                <div className="order-id">
                  <span>Order ID:</span>
                  <strong>#{order._id.slice(-8).toUpperCase()}</strong>
                </div>
                <div className="order-total">
                  <span>Total Amount:</span>
                  <strong>₹{order.total.toFixed(2)}</strong>
                </div>
                <div className="order-status">
                  <span>Status:</span>
                  <span className="status-badge">{order.orderStatus}</span>
                </div>
              </div>

              {/* Download Invoice Button */}
              {order.paymentStatus === "paid" && (
                <div className="invoice-download-section">
                  <button
                    className="btn btn-success btn-invoice"
                    onClick={() => setShowInvoice(true)}
                  >
                    <FiDownload /> Download Invoice
                  </button>
                </div>
              )}

              {/* Order Items */}
              <div className="order-items-section">
                <h3>Your Items</h3>
                <div className="order-items-grid">
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item-card">
                      <img
                        src={
                          item.image ||
                          "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200"
                        }
                        alt={item.name}
                      />
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p>
                          Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                        </p>
                      </div>
                      {order.orderStatus === "delivered" && (
                        <button
                          className="quick-rate-btn"
                          onClick={() => handleQuickRate(item)}
                        >
                          <FiStar /> Rate
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rate Your Experience Section */}
              {order.orderStatus === "delivered" && (
                <div className="rate-experience-section">
                  <h3>🌟 How was your experience?</h3>
                  <p>Your feedback helps us serve you better!</p>
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      navigate("/dashboard", { state: { tab: "reviews" } })
                    }
                  >
                    <FiStar /> Write Detailed Reviews
                  </button>
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/dashboard")}
            >
              <FiShoppingBag /> View My Orders
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/menu")}
            >
              <FiHome /> Continue Shopping
            </button>
          </div>
        </div>
      </div>

      {/* Quick Review Modal */}
      <Modal
        isOpen={showQuickReview}
        onClose={() => setShowQuickReview(false)}
        title="Quick Rating"
      >
        {selectedItem && (
          <div className="quick-review-content">
            <div className="quick-review-product">
              <img
                src={
                  selectedItem.image ||
                  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200"
                }
                alt={selectedItem.name}
              />
              <h4>{selectedItem.name}</h4>
            </div>

            <div className="quick-rating-section">
              <p>How would you rate this item?</p>
              <div className="quick-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={`star-btn ${quickRating >= star ? "active" : ""}`}
                    onClick={() => setQuickRating(star)}
                  >
                    <FiStar />
                  </button>
                ))}
              </div>
              {quickRating > 0 && (
                <p className="rating-message">
                  {getRatingMessage(quickRating)}
                </p>
              )}
            </div>

            <div className="quick-review-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowQuickReview(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={submitQuickReview}
                disabled={quickReviewSubmitting || quickRating === 0}
              >
                {quickReviewSubmitting ? "Submitting..." : "Submit Rating"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Invoice Modal */}
      {showInvoice && order && (
        <Invoice order={order} onClose={() => setShowInvoice(false)} />
      )}
    </div>
  );
};

export default OrderSuccess;
