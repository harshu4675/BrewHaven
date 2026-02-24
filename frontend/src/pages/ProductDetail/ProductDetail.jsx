import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiShoppingCart, FiMinus, FiPlus, FiStar } from "react-icons/fi";
import { productsAPI, reviewsAPI } from "../../services/api";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import Loader from "../../components/Loader/Loader";
import StarRating from "../../components/StarRating/StarRating";
import ReviewList from "../../components/ReviewList/ReviewList";
import ReviewForm from "../../components/ReviewForm/ReviewForm";
import Modal from "../../components/Modal/Modal";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showAlert } = useApp();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [canReview, setCanReview] = useState(false);
  const [reviewOrderId, setReviewOrderId] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!id) {
      showAlert("error", "Error", "Invalid product ID");
      navigate("/menu");
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      setLoading(true);

      try {
        // Fetch product and reviews
        const [productRes, reviewsRes] = await Promise.all([
          productsAPI.getById(id),
          reviewsAPI.getProductReviews(id),
        ]);

        if (isMounted) {
          setProduct(productRes.data);
          setReviews(reviewsRes.data);

          // Check review eligibility if authenticated
          if (isAuthenticated) {
            try {
              const reviewCheckRes = await reviewsAPI.canReview(id);
              if (isMounted) {
                setCanReview(reviewCheckRes.data.canReview);
                setReviewOrderId(reviewCheckRes.data.orderId);
              }
            } catch (error) {
              // User might not be eligible to review
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage =
            error.response?.data?.message || "Failed to load product";
          showAlert("error", "Error", errorMessage);

          if (error.response?.status === 404) {
            setTimeout(() => navigate("/menu"), 2000);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, isAuthenticated, navigate, showAlert]);

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getProductReviews(id);
      setReviews(response.data);
    } catch (error) {
      showAlert("error", "Error", "Failed to load reviews");
    }
  };

  const checkCanReview = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await reviewsAPI.canReview(id);
      setCanReview(response.data.canReview);
      setReviewOrderId(response.data.orderId);
    } catch (error) {
      // Silent fail - user might not be eligible
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (!product.isAvailable) {
      showAlert(
        "warning",
        "Unavailable",
        "This product is currently unavailable",
      );
      return;
    }

    if (quantity > product.stock) {
      showAlert(
        "warning",
        "Insufficient Stock",
        `Only ${product.stock} items available`,
      );
      return;
    }

    try {
      addItem(product, quantity);
      showAlert(
        "success",
        "Added to Cart",
        `${quantity}x ${product.name} added to cart`,
      );
    } catch (error) {
      showAlert("error", "Error", "Failed to add item to cart");
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      if (editingReview) {
        await reviewsAPI.update(editingReview._id, reviewData);
        showAlert("success", "Success", "Review updated successfully");
      } else {
        await reviewsAPI.create({
          ...reviewData,
          product: id,
          order: reviewOrderId,
        });
        showAlert("success", "Success", "Review submitted successfully");
      }

      setShowReviewForm(false);
      setEditingReview(null);
      await fetchReviews();
      await checkCanReview();
    } catch (error) {
      showAlert(
        "error",
        "Error",
        error.response?.data?.message || "Failed to submit review",
      );
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await reviewsAPI.delete(reviewId);
      showAlert("success", "Success", "Review deleted successfully");
      await fetchReviews();
      await checkCanReview();
    } catch (error) {
      showAlert(
        "error",
        "Error",
        error.response?.data?.message || "Failed to delete review",
      );
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    if (!isAuthenticated) {
      showAlert(
        "info",
        "Login Required",
        "Please login to mark reviews as helpful",
      );
      return;
    }

    try {
      await reviewsAPI.markHelpful(reviewId);
      await fetchReviews();
    } catch (error) {
      showAlert(
        "error",
        "Error",
        error.response?.data?.message || "Failed to mark review as helpful",
      );
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getProductImage = () => {
    if (imageError || !product?.image) {
      return "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600";
    }
    return product.image;
  };

  if (loading) {
    return <Loader text="Loading product..." />;
  }

  if (!product) {
    return (
      <div className="product-detail-page page">
        <div className="page-content">
          <div className="container">
            <div className="empty-state">
              <h2>Product not found</h2>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/menu")}
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page page">
      <div className="page-content">
        <div className="container">
          <div className="product-detail-container">
            {/* Product Info Section */}
            <div className="product-detail-grid">
              <div className="product-image-section">
                <img
                  src={getProductImage()}
                  alt={product.name}
                  className="product-main-image"
                  onError={handleImageError}
                />
              </div>

              <div className="product-info-section">
                {product.category && (
                  <div className="product-category">
                    {product.category.name}
                  </div>
                )}
                <h1 className="product-title">{product.name}</h1>

                <div className="product-rating">
                  <StarRating
                    rating={product.averageRating || 0}
                    size="medium"
                  />
                  <span className="rating-text">
                    {product.averageRating
                      ? `${product.averageRating.toFixed(1)} (${product.totalReviews || 0} reviews)`
                      : "No reviews yet"}
                  </span>
                </div>

                <div className="product-price">
                  ₹{Number(product.price).toFixed(2)}
                </div>

                {product.description && (
                  <p className="product-description">{product.description}</p>
                )}

                <div className="product-availability">
                  <span
                    className={`availability-badge ${product.isAvailable ? "available" : "unavailable"}`}
                  >
                    {product.isAvailable ? "✓ Available" : "✗ Out of Stock"}
                  </span>
                  {product.isAvailable &&
                    product.stock > 0 &&
                    product.stock < 10 && (
                      <span className="stock-warning">
                        Only {product.stock} left in stock!
                      </span>
                    )}
                </div>

                <div className="quantity-selector">
                  <label>Quantity:</label>
                  <div className="quantity-controls">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <FiMinus />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      readOnly
                      aria-label="Quantity"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      disabled={
                        !product.isAvailable || quantity >= (product.stock || 0)
                      }
                      aria-label="Increase quantity"
                    >
                      <FiPlus />
                    </button>
                  </div>
                </div>

                <div className="product-actions">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={handleAddToCart}
                    disabled={!product.isAvailable}
                  >
                    <FiShoppingCart /> Add to Cart
                  </button>
                  {isAuthenticated && canReview && (
                    <button
                      className="btn btn-secondary btn-lg"
                      onClick={() => setShowReviewForm(true)}
                    >
                      <FiStar /> Write a Review
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="product-reviews-section">
              <ReviewList
                reviews={reviews}
                onEdit={handleEditReview}
                onDelete={handleDeleteReview}
                onMarkHelpful={handleMarkHelpful}
                currentUserId={user?._id}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <Modal
          isOpen={showReviewForm}
          onClose={() => {
            setShowReviewForm(false);
            setEditingReview(null);
          }}
          width="700px"
        >
          <ReviewForm
            product={product}
            orderId={reviewOrderId}
            existingReview={editingReview}
            onSubmit={handleReviewSubmit}
            onCancel={() => {
              setShowReviewForm(false);
              setEditingReview(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default ProductDetail;
