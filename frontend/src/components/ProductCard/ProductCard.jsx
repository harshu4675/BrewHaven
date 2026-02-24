import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiHeart, FiPlus, FiStar, FiEye } from "react-icons/fi";
import { FaHeart, FaStar } from "react-icons/fa";
import { useCart } from "../../context/CartContext";
import { useApp } from "../../context/AppContext";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showAlert, isCafeOpen } = useApp();
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Calculate discount percentage
  const originalPrice = product.originalPrice || product.price * 1.2;
  const discountPercent = Math.round(
    ((originalPrice - product.price) / originalPrice) * 100,
  );

  const handleAddToCart = (e) => {
    e.stopPropagation();

    if (!isCafeOpen) {
      showAlert("warning", "Café Closed", "The café is currently closed.");
      return;
    }

    if (product.stock <= 0) {
      showAlert("error", "Out of Stock", "This item is currently unavailable.");
      return;
    }

    addItem(product);
    showAlert(
      "success",
      "Added to Cart",
      `${product.name} has been added to your cart.`,
    );
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    showAlert(
      "success",
      isWishlisted ? "Removed from Wishlist" : "Added to Wishlist",
      `${product.name} has been ${isWishlisted ? "removed from" : "added to"} your wishlist.`,
    );
  };

  const handleCardClick = () => {
    navigate(`/product/${product._id}`);
  };

  const imageUrl =
    product.image ||
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400";

  // Rating (replace with actual data)
  const rating = product.rating || 4.2;
  const reviewCount =
    product.reviewCount || Math.floor(Math.random() * 500) + 50;

  return (
    <div className="cafe-product-card" onClick={handleCardClick}>
      {/* Wishlist Button */}
      <button
        className={`cafe-wishlist-btn ${isWishlisted ? "active" : ""}`}
        onClick={handleWishlist}
        aria-label="Add to wishlist"
      >
        {isWishlisted ? <FaHeart /> : <FiHeart />}
      </button>

      {/* Product Image */}
      <div className="cafe-product-image">
        <img src={imageUrl} alt={product.name} loading="lazy" />

        {/* Badges */}
        <div className="cafe-badges">
          {product.featured && (
            <span className="cafe-badge cafe-badge-featured">
              <FiStar /> Featured
            </span>
          )}
          {discountPercent > 0 && (
            <span className="cafe-badge cafe-badge-discount">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {product.stock <= 0 && (
          <div className="cafe-out-of-stock-overlay">
            <span>Out of Stock</span>
          </div>
        )}

        {/* Quick View Button */}
        <button className="cafe-quick-view-btn" onClick={handleCardClick}>
          <FiEye /> Quick View
        </button>
      </div>

      {/* Product Info */}
      <div className="cafe-product-info">
        {/* Category */}
        <span className="cafe-product-category">
          {product.category?.name || "Café Special"}
        </span>

        {/* Product Name */}
        <h3 className="cafe-product-name">{product.name}</h3>

        {/* Description */}
        <p className="cafe-product-description">{product.description}</p>

        {/* Rating */}
        <div className="cafe-rating-container">
          <span className="cafe-rating">
            {rating.toFixed(1)}
            <FaStar className="cafe-star-icon" />
          </span>
          <span className="cafe-review-count">({reviewCount} reviews)</span>
        </div>

        {/* Price Section */}
        <div className="cafe-price-container">
          <span className="cafe-current-price">
            ₹{product.price.toFixed(0)}
          </span>
          {discountPercent > 0 && (
            <>
              <span className="cafe-original-price">
                ₹{originalPrice.toFixed(0)}
              </span>
              <span className="cafe-discount-text">{discountPercent}% off</span>
            </>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          className="cafe-add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={product.stock <= 0 || !isCafeOpen}
        >
          <FiPlus />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
