import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiShoppingBag,
  FiSettings,
  FiLogOut,
  FiEdit2,
  FiEye,
  FiStar,
  FiTrash2,
  FiDownload,
  FiMessageSquare,
  FiArrowDown,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { ordersAPI, reviewsAPI } from "../../services/api";
import Loader from "../../components/Loader/Loader";
import Modal from "../../components/Modal/Modal";
import ReviewForm from "../../components/ReviewForm/ReviewForm";
import StarRating from "../../components/StarRating/StarRating";
import Invoice from "../../components/Invoice/Invoice";
import OrderReviewPrompt from "../../components/OrderReviewPrompt/OrderReviewPrompt";
import "./Dashboard.css";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [reviewableProducts, setReviewableProducts] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  // Review Prompt State
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);

  const { user, logout, updateProfile } = useAuth();
  const { showAlert } = useApp();
  const navigate = useNavigate();

  // Check for pending reviews on mount
  useEffect(() => {
    checkPendingReviews();
  }, []);

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    } else if (activeTab === "reviews") {
      fetchReviewableProducts();
    } else if (activeTab === "my-reviews") {
      fetchMyReviews();
    }
  }, [activeTab]);

  // Check pending reviews function
  const checkPendingReviews = async () => {
    try {
      const response = await reviewsAPI.getReviewableOrders();
      const pendingOrders = response.data || [];
      setPendingReviewCount(pendingOrders.length);

      // Show prompt if there are pending reviews
      const lastPromptTime = sessionStorage.getItem("lastReviewPrompt");
      const now = Date.now();

      if (pendingOrders.length > 0) {
        if (!lastPromptTime || now - parseInt(lastPromptTime) > 3600000) {
          setTimeout(() => {
            setShowReviewPrompt(true);
            sessionStorage.setItem("lastReviewPrompt", now.toString());
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Failed to check pending reviews:", error);
      // Don't show error to user, just silently fail
    }
  };

  const viewInvoice = (order) => {
    setInvoiceOrder(order);
    setShowInvoice(true);
  };

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    zipCode: user?.address?.zipCode || "",
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getMyOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      showAlert("error", "Error", "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewableProducts = async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getReviewableProducts();
      setReviewableProducts(response.data || []);
    } catch (error) {
      console.error("Failed to fetch reviewable products:", error);
      showAlert("error", "Error", "Failed to fetch reviewable products");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const response = await reviewsAPI.getMyReviews();
      setMyReviews(response.data || []);
    } catch (error) {
      console.error("Failed to fetch my reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        name: profileData.name,
        email: profileData.email,
        phone: profileData.phone,
        address: {
          street: profileData.street,
          city: profileData.city,
          state: profileData.state,
          zipCode: profileData.zipCode,
        },
      });
      showAlert("success", "Success", "Profile updated successfully");
    } catch (error) {
      showAlert("error", "Error", error.message);
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleReviewClick = (productInfo) => {
    setSelectedProduct(productInfo);
    setEditingReview(null);
    setShowReviewForm(true);
  };

  const handleReviewOrder = () => {
    setShowReviewPrompt(true);
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setSelectedProduct({
      product: review.product,
      orderId: review.order,
    });
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await reviewsAPI.delete(reviewId);
        showAlert("success", "Success", "Review deleted successfully");
        fetchMyReviews();
        fetchReviewableProducts();
      } catch (error) {
        showAlert("error", "Error", "Failed to delete review");
      }
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      if (editingReview) {
        await reviewsAPI.update(editingReview._id, reviewData);
        showAlert("success", "Success", "Review updated successfully");
      } else {
        await reviewsAPI.create(reviewData);
        showAlert("success", "Success", "Review submitted successfully");
      }
      setShowReviewForm(false);
      setSelectedProduct(null);
      setEditingReview(null);
      fetchReviewableProducts();
      checkPendingReviews();
      if (activeTab === "my-reviews") {
        fetchMyReviews();
      }
    } catch (error) {
      showAlert(
        "error",
        "Error",
        error.response?.data?.message || "Failed to submit review",
      );
    }
  };

  const handleReviewPromptComplete = () => {
    showAlert(
      "success",
      "Thank You!",
      "Your reviews help other customers and our team!",
    );
    checkPendingReviews();
    fetchReviewableProducts();
    if (activeTab === "my-reviews") {
      fetchMyReviews();
    }
  };

  const getStatusClass = (status) => {
    const statusClasses = {
      pending: "status-pending",
      confirmed: "status-confirmed",
      preparing: "status-preparing",
      ready: "status-ready",
      delivered: "status-delivered",
      cancelled: "status-cancelled",
    };
    return statusClasses[status] || "status-pending";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canReviewOrder = (order) => {
    return order.orderStatus === "delivered" && order.paymentStatus === "paid";
  };

  return (
    <div className="dashboard-page page">
      <div className="page-content">
        <div className="container">
          <div className="dashboard-container">
            <aside className="dashboard-sidebar">
              <div className="user-info">
                <div className="user-avatar">
                  <FiUser />
                </div>
                <h3>{user?.name}</h3>
                <p>{user?.email}</p>
              </div>

              <nav className="sidebar-menu">
                <button
                  className={activeTab === "orders" ? "active" : ""}
                  onClick={() => setActiveTab("orders")}
                >
                  <FiShoppingBag /> My Orders
                </button>
                <button
                  className={activeTab === "reviews" ? "active" : ""}
                  onClick={() => setActiveTab("reviews")}
                >
                  <FiStar /> Write Reviews
                  {pendingReviewCount > 0 && (
                    <span className="review-badge">{pendingReviewCount}</span>
                  )}
                </button>
                <button
                  className={activeTab === "my-reviews" ? "active" : ""}
                  onClick={() => setActiveTab("my-reviews")}
                >
                  <FiEdit2 /> My Reviews
                </button>
                <button
                  className={activeTab === "profile" ? "active" : ""}
                  onClick={() => setActiveTab("profile")}
                >
                  <FiSettings /> Profile Settings
                </button>
              </nav>

              <div className="logout-btn">
                <button onClick={handleLogout}>
                  <FiLogOut /> Logout
                </button>
              </div>
            </aside>

            <main className="dashboard-content">
              {/* Orders Tab */}
              {activeTab === "orders" && (
                <>
                  <div className="dashboard-header">
                    <h2>My Orders</h2>
                  </div>

                  {loading ? (
                    <Loader text="Loading orders..." />
                  ) : orders.length > 0 ? (
                    <table className="orders-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order._id}>
                            <td>#{order._id.slice(-8).toUpperCase()}</td>
                            <td>{formatDate(order.createdAt)}</td>
                            <td>{order.items.length} items</td>
                            <td>₹{order.total.toFixed(2)}</td>
                            <td>
                              <span
                                className={`order-status ${getStatusClass(
                                  order.orderStatus,
                                )}`}
                              >
                                {order.orderStatus}
                              </span>
                            </td>
                            <td className="action-buttons">
                              <button
                                className="action-btn view"
                                onClick={() => viewOrderDetails(order)}
                                title="View Order"
                              >
                                See
                              </button>
                              {order.paymentStatus === "paid" && (
                                <button
                                  className="action-btn download"
                                  onClick={() => viewInvoice(order)}
                                  title="Download Invoice"
                                >
                                  Save
                                </button>
                              )}
                              {canReviewOrder(order) && (
                                <button
                                  className="action-btn review"
                                  onClick={() => handleReviewOrder()}
                                  title="Write Review"
                                >
                                  Rate
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="no-orders">
                      <FiShoppingBag className="icon" />
                      <h3>No orders yet</h3>
                      <p>Start ordering from our menu!</p>
                    </div>
                  )}
                </>
              )}

              {/* Write Reviews Tab */}
              {activeTab === "reviews" && (
                <>
                  <div className="dashboard-header">
                    <h2>Write Reviews</h2>
                    <p>Review products from your delivered orders</p>
                  </div>

                  {pendingReviewCount > 0 && (
                    <div className="review-all-section">
                      <button
                        className="btn btn-primary review-all-btn"
                        onClick={() => setShowReviewPrompt(true)}
                      >
                        <FiStar /> Review All Orders ({pendingReviewCount})
                      </button>
                    </div>
                  )}

                  {loading ? (
                    <Loader text="Loading products..." />
                  ) : reviewableProducts.length > 0 ? (
                    <div className="reviewable-products-grid">
                      {reviewableProducts.map((item, index) => (
                        <div
                          key={`${item.product?._id || index}-${item.orderId}`}
                          className="reviewable-product-card"
                        >
                          <img
                            src={
                              item.product?.image ||
                              "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200"
                            }
                            alt={item.product?.name || "Product"}
                          />
                          <div className="product-info">
                            <h4>{item.product?.name || "Product"}</h4>
                            <p>
                              {item.product?.description?.substring(0, 80)}...
                            </p>
                            <small>
                              Ordered on {formatDate(item.orderDate)}
                            </small>
                          </div>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleReviewClick(item)}
                          >
                            <FiStar /> Write Review
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-orders">
                      <FiStar className="icon" />
                      <h3>No products to review</h3>
                      <p>Products from delivered orders will appear here</p>
                    </div>
                  )}
                </>
              )}

              {/* My Reviews Tab */}
              {activeTab === "my-reviews" && (
                <>
                  <div className="dashboard-header">
                    <h2>My Reviews</h2>
                    <p>Manage your submitted reviews</p>
                  </div>

                  {loading ? (
                    <Loader text="Loading reviews..." />
                  ) : myReviews.length > 0 ? (
                    <div className="my-reviews-list">
                      {myReviews.map((review) => (
                        <div key={review._id} className="my-review-card">
                          <img
                            src={
                              review.product?.image ||
                              "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200"
                            }
                            alt={review.product?.name}
                          />
                          <div className="review-details">
                            <h4>{review.product?.name}</h4>
                            <div className="review-meta">
                              <StarRating rating={review.rating} size="small" />
                              <span>{formatDate(review.createdAt)}</span>
                            </div>
                            <p className="review-title">{review.title}</p>
                            <p className="review-comment">{review.comment}</p>
                            {review.adminResponse && (
                              <div className="admin-response">
                                <strong>Response from café:</strong>
                                <p>{review.adminResponse.message}</p>
                              </div>
                            )}
                          </div>
                          <div className="review-actions">
                            <button
                              className="action-btn edit"
                              onClick={() => handleEditReview(review)}
                              title="Edit Review"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              className="action-btn delete"
                              onClick={() => handleDeleteReview(review._id)}
                              title="Delete Review"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-orders">
                      <FiEdit2 className="icon" />
                      <h3>No reviews yet</h3>
                      <p>Your submitted reviews will appear here</p>
                    </div>
                  )}
                </>
              )}

              {/* Profile Tab */}
              {activeTab === "profile" && (
                <>
                  <div className="dashboard-header">
                    <h2>Profile Settings</h2>
                  </div>

                  <form className="profile-form" onSubmit={handleProfileSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Full Name</label>
                        <input
                          type="text"
                          name="name"
                          className="form-control"
                          value={profileData.name}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Email Address</label>
                        <input
                          type="email"
                          name="email"
                          className="form-control"
                          value={profileData.email}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        className="form-control"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                      />
                    </div>

                    <h4 style={{ marginTop: "30px", marginBottom: "20px" }}>
                      Delivery Address
                    </h4>

                    <div className="form-group">
                      <label>Street Address</label>
                      <input
                        type="text"
                        name="street"
                        className="form-control"
                        value={profileData.street}
                        onChange={handleProfileChange}
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>City</label>
                        <input
                          type="text"
                          name="city"
                          className="form-control"
                          value={profileData.city}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>State</label>
                        <input
                          type="text"
                          name="state"
                          className="form-control"
                          value={profileData.state}
                          onChange={handleProfileChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>PIN Code</label>
                        <input
                          type="text"
                          name="zipCode"
                          className="form-control"
                          value={profileData.zipCode}
                          onChange={handleProfileChange}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                  </form>
                </>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title={`Order #${selectedOrder?._id.slice(-8).toUpperCase()}`}
      >
        {selectedOrder && (
          <div className="order-details">
            <div className="order-status-banner">
              <span
                className={`order-status ${getStatusClass(
                  selectedOrder.orderStatus,
                )}`}
              >
                {selectedOrder.orderStatus}
              </span>
              <span className="order-date">
                {formatDate(selectedOrder.createdAt)}
              </span>
            </div>

            {canReviewOrder(selectedOrder) && (
              <div className="review-prompt-banner">
                <FiStar className="icon" />
                <span>How was your order?</span>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setShowOrderModal(false);
                    setShowReviewPrompt(true);
                  }}
                >
                  Write Review
                </button>
              </div>
            )}

            {selectedOrder.paymentStatus === "paid" && (
              <div className="invoice-download-section">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowOrderModal(false);
                    viewInvoice(selectedOrder);
                  }}
                >
                  <FiDownload /> Download Invoice
                </button>
              </div>
            )}

            <div className="order-items-list">
              <h4>Order Items</h4>
              {selectedOrder.items.map((item, index) => (
                <div key={index} className="order-item">
                  <img
                    src={
                      item.image ||
                      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=80"
                    }
                    alt={item.name}
                  />
                  <div className="item-info">
                    <h5>{item.name}</h5>
                    <p>
                      Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                    </p>
                  </div>
                  <span className="item-total">
                    ₹{(item.quantity * item.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="order-address">
              <h4>Delivery Address</h4>
              <p>
                {selectedOrder.shippingAddress?.street}
                <br />
                {selectedOrder.shippingAddress?.city},{" "}
                {selectedOrder.shippingAddress?.state}{" "}
                {selectedOrder.shippingAddress?.zipCode}
              </p>
            </div>

            <div className="order-summary-details">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{selectedOrder.subtotal?.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax</span>
                <span>₹{selectedOrder.tax?.toFixed(2)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="summary-row">
                  <span>Discount</span>
                  <span>-₹{selectedOrder.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {selectedOrder.paymentId && (
              <div className="payment-info-section">
                <h4>Payment Information</h4>
                <p>
                  <strong>Payment ID:</strong> {selectedOrder.paymentId}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className="badge badge-success">
                    {selectedOrder.paymentStatus}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Invoice Modal */}
      {showInvoice && (
        <Invoice
          order={invoiceOrder}
          onClose={() => {
            setShowInvoice(false);
            setInvoiceOrder(null);
          }}
        />
      )}

      {/* Review Form Modal */}
      <Modal
        isOpen={showReviewForm}
        onClose={() => {
          setShowReviewForm(false);
          setSelectedProduct(null);
          setEditingReview(null);
        }}
      >
        {selectedProduct && (
          <ReviewForm
            product={selectedProduct.product}
            orderId={selectedProduct.orderId}
            existingReview={editingReview}
            onSubmit={handleReviewSubmit}
            onCancel={() => {
              setShowReviewForm(false);
              setSelectedProduct(null);
              setEditingReview(null);
            }}
          />
        )}
      </Modal>

      {/* Order Review Prompt Modal */}
      <OrderReviewPrompt
        isOpen={showReviewPrompt}
        onClose={() => setShowReviewPrompt(false)}
        onComplete={handleReviewPromptComplete}
      />
    </div>
  );
};

export default Dashboard;
