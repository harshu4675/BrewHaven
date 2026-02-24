import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiTrash2,
  FiPlus,
  FiMinus,
  FiShoppingBag,
  FiArrowRight,
} from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import "./Cart.css";

const Cart = () => {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getSubtotal,
    getTax,
    getTotal,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const { taxRate, isCafeOpen, showAlert } = useApp();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isCafeOpen) {
      showAlert(
        "warning",
        "Café Closed",
        "The café is currently closed. Please try again later.",
      );
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
      return;
    }

    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="cart-page page">
        <div className="container">
          <div className="empty-cart">
            <FiShoppingBag className="icon" />
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <Link to="/menu" className="btn btn-primary">
              Browse Menu <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page page">
      <div className="page-header">
        <div className="container">
          <h1>Your Cart</h1>
          <p>Review your items before checkout</p>
        </div>
      </div>

      <div className="page-content">
        <div className="container">
          <div className="cart-container">
            <div className="cart-items">
              <div className="cart-header">
                <h2>Cart Items ({items.length})</h2>
                <button className="clear-cart-btn" onClick={clearCart}>
                  <FiTrash2 /> Clear Cart
                </button>
              </div>

              {items.map((item) => (
                <div key={item._id} className="cart-item">
                  <div className="cart-item-image">
                    <img
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200"
                      }
                      alt={item.name}
                    />
                  </div>
                  <div className="cart-item-details">
                    <h3>{item.name}</h3>
                    <p className="category">
                      {item.category?.name || "Uncategorized"}
                    </p>
                    <p className="price">₹{item.price.toFixed(2)}</p>
                  </div>
                  <div className="cart-item-actions">
                    <div className="quantity-controls">
                      <button
                        onClick={() =>
                          updateQuantity(item._id, item.quantity - 1)
                        }
                      >
                        <FiMinus />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        onClick={() =>
                          updateQuantity(item._id, item.quantity + 1)
                        }
                      >
                        <FiPlus />
                      </button>
                    </div>
                    <button
                      className="remove-item-btn"
                      onClick={() => removeItem(item._id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div className="summary-card">
                <h3>Order Summary</h3>

                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{getSubtotal().toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Tax ({taxRate}%)</span>
                  <span>₹{getTax(taxRate).toFixed(2)}</span>
                </div>

                <div className="summary-row total">
                  <span>Total</span>
                  <span>₹{getTotal(taxRate).toFixed(2)}</span>
                </div>

                <button
                  className="btn btn-primary checkout-btn"
                  onClick={handleCheckout}
                  disabled={!isCafeOpen}
                >
                  {!isCafeOpen ? "Café Closed" : "Proceed to Checkout"}
                </button>

                <Link
                  to="/menu"
                  className="btn btn-secondary"
                  style={{ width: "100%", marginTop: "10px" }}
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
