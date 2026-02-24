import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiCreditCard, FiCheck, FiShield } from "react-icons/fi";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { ordersAPI, couponsAPI } from "../../services/api";
import Loader from "../../components/Loader/Loader";
import "./Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getSubtotal, getTax, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { taxRate, showAlert, isCafeOpen } = useApp();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [formData, setFormData] = useState({
    phone: user?.phone || "",
    notes: "",
  });

  // Fix: Navigate inside useEffect
  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const { phone } = formData;
    if (!phone) {
      showAlert("error", "Error", "Please enter your phone number");
      return false;
    }
    if (phone.length < 10) {
      showAlert("error", "Error", "Please enter a valid phone number");
      return false;
    }
    return true;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Safe getter functions to prevent undefined errors
  const safeGetSubtotal = () => {
    const subtotal = getSubtotal();
    return typeof subtotal === "number" && !isNaN(subtotal) ? subtotal : 0;
  };

  const safeGetTax = () => {
    const tax = getTax(taxRate || 0);
    return typeof tax === "number" && !isNaN(tax) ? tax : 0;
  };

  // Calculate discount based on coupon type
  const calculateDiscount = (coupon, subtotal) => {
    if (!coupon) return 0;

    let discountAmount = 0;

    // Handle percentage discount
    if (coupon.discountType === "percentage") {
      discountAmount =
        (subtotal * (coupon.discountValue || coupon.discount || 0)) / 100;

      // Apply max discount limit if exists
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    }
    // Handle fixed amount discount
    else if (
      coupon.discountType === "fixed" ||
      coupon.discountType === "amount"
    ) {
      discountAmount = coupon.discountValue || coupon.discount || 0;
    }
    // Fallback: check if discount value exists directly
    else if (coupon.discountValue || coupon.discount) {
      discountAmount = coupon.discountValue || coupon.discount || 0;
    }

    // Make sure discount doesn't exceed subtotal
    if (discountAmount > subtotal) {
      discountAmount = subtotal;
    }

    return discountAmount;
  };

  // Get final total with discount
  const getFinalTotal = () => {
    const subtotal = safeGetSubtotal();
    const tax = safeGetTax();
    const discountAmount = discount || 0;
    const total = subtotal + tax - discountAmount;
    return total > 0 ? total : 0;
  };

  // Get subtotal after discount (for tax calculation if needed)
  const getSubtotalAfterDiscount = () => {
    const subtotal = safeGetSubtotal();
    const discountAmount = discount || 0;
    return subtotal - discountAmount > 0 ? subtotal - discountAmount : 0;
  };

  const handlePayment = async () => {
    // Validate form first
    if (!validateForm()) return;

    // Check if cafe is open
    if (!isCafeOpen) {
      showAlert(
        "warning",
        "Café Closed",
        "The café is currently closed. Please try again later.",
      );
      return;
    }

    setLoading(true);

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        showAlert(
          "error",
          "Error",
          "Failed to load payment gateway. Please try again.",
        );
        setLoading(false);
        return;
      }

      // Create Razorpay order with final total (including discount)
      const totalAmount = getFinalTotal();
      const { data } = await ordersAPI.createRazorpayOrder(totalAmount);

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Brew Haven Café",
        description: "Order Payment",
        order_id: data.orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await ordersAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyResponse.data.verified) {
              // Create order data INSIDE the handler
              const orderData = {
                items: items.map((item) => ({
                  product: item._id,
                  name: item.name,
                  price: item.price || 0,
                  quantity: item.quantity || 1,
                  image: item.image,
                })),
                customerPhone: formData.phone,
                paymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                subtotal: safeGetSubtotal(),
                tax: safeGetTax(),
                discount: discount || 0,
                couponCode: appliedCoupon?.code || null,
                total: totalAmount,
                notes: formData.notes,
              };

              // Create order in database
              const orderResponse = await ordersAPI.create(orderData);

              // Clear cart
              clearCart();

              // Show success message
              showAlert(
                "success",
                "Order Placed!",
                "Your order has been placed successfully.",
              );

              // Navigate to order success page with order ID
              navigate("/order-success", {
                state: { orderId: orderResponse.data._id },
              });
            } else {
              showAlert(
                "error",
                "Payment Failed",
                "Payment verification failed. Please try again.",
              );
            }
          } catch (error) {
            console.error("Order creation error:", error);
            showAlert(
              "error",
              "Error",
              error.response?.data?.message || "Failed to create order",
            );
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: formData.phone,
        },
        theme: {
          color: "#8B4513",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            showAlert("info", "Payment Cancelled", "Payment was cancelled.");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response) {
        showAlert("error", "Payment Failed", response.error.description);
        setLoading(false);
      });
      razorpay.open();
      setLoading(false);
    } catch (error) {
      console.error("Payment error:", error);
      showAlert(
        "error",
        "Error",
        error.response?.data?.message || "Payment initialization failed",
      );
      setLoading(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      showAlert("error", "Error", "Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    try {
      const subtotal = safeGetSubtotal();
      const response = await couponsAPI.validate(couponCode, subtotal);

      // Debug: Log the response to see its structure
      console.log("Coupon API Response:", response.data);

      const couponData = response.data.coupon;
      let discountAmount = 0;

      // Check if API directly returns discount amount
      if (
        response.data.discount !== undefined &&
        response.data.discount !== null
      ) {
        discountAmount = Number(response.data.discount);
      }
      // Otherwise calculate based on coupon data
      else if (couponData) {
        discountAmount = calculateDiscount(couponData, subtotal);
      }

      // Debug: Log calculated discount
      console.log("Calculated Discount:", discountAmount);

      setAppliedCoupon(couponData);
      setDiscount(discountAmount);

      showAlert(
        "success",
        "Coupon Applied!",
        `You saved ₹${discountAmount.toFixed(2)}!`,
      );
    } catch (error) {
      console.error("Coupon Error:", error);
      showAlert(
        "error",
        "Invalid Coupon",
        error.response?.data?.message || "Coupon not valid",
      );
      setAppliedCoupon(null);
      setDiscount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode("");
    showAlert("info", "Coupon Removed", "Coupon has been removed");
  };

  // Show loader while redirecting (items.length === 0 case)
  if (items.length === 0) {
    return <Loader text="Redirecting..." />;
  }

  return (
    <div className="checkout-page page">
      <div className="page-header">
        <div className="container">
          <h1>Checkout</h1>
          <p>Complete your order</p>
        </div>
      </div>

      <div className="page-content">
        <div className="container">
          <div className="checkout-container">
            <div className="checkout-form">
              {/* Contact Information */}
              <div className="checkout-section">
                <h3>
                  <FiUser className="icon" /> Contact Information
                </h3>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    placeholder="Your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="checkout-section">
                <h3>
                  <FiCreditCard className="icon" /> Payment Method
                </h3>
                <div className="payment-info">
                  <div className="payment-option selected">
                    <div className="payment-option-content">
                      <img
                        src="https://razorpay.com/assets/razorpay-glyph.svg"
                        alt="Razorpay"
                        className="payment-logo"
                      />
                      <div>
                        <h4>Razorpay Secure Payment</h4>
                        <p>
                          Pay securely using UPI, Cards, Net Banking, Wallets
                        </p>
                      </div>
                    </div>
                    <FiCheck className="check-icon" />
                  </div>
                  <div className="payment-methods-icons">
                    <span className="payment-method-badge">UPI</span>
                    <span className="payment-method-badge">Cards</span>
                    <span className="payment-method-badge">Net Banking</span>
                    <span className="payment-method-badge">Wallets</span>
                  </div>
                </div>
              </div>

              {/* Order Notes */}
              <div className="checkout-section">
                <h3>Order Notes (Optional)</h3>
                <div className="form-group">
                  <textarea
                    name="notes"
                    className="form-control"
                    placeholder="Any special instructions for your order..."
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>
              </div>

              {/* Pickup Notice */}
              <div className="checkout-section pickup-notice">
                <div className="pickup-info">
                  <span className="pickup-icon">🏪</span>
                  <div>
                    <h4>Counter Pickup</h4>
                    <p>
                      Your order will be ready for pickup at our counter. We'll
                      notify you when it's ready!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <div className="summary-card">
                <h3>Order Summary</h3>

                <div className="summary-items">
                  {items.map((item) => (
                    <div key={item._id} className="summary-item">
                      <img
                        src={
                          item.image ||
                          "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=100"
                        }
                        alt={item.name}
                      />
                      <div className="summary-item-info">
                        <h4>{item.name}</h4>
                        <p>Qty: {item.quantity}</p>
                      </div>
                      <span className="summary-item-price">
                        ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coupon Code Section */}
                <div className="coupon-section">
                  {appliedCoupon ? (
                    <div className="applied-coupon">
                      <div className="coupon-info">
                        <span className="coupon-badge">
                          🎉 {appliedCoupon.code}
                        </span>
                        <span className="coupon-discount">
                          -₹{(discount || 0).toFixed(2)}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="remove-coupon"
                        onClick={removeCoupon}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="coupon-input">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        className="form-control"
                      />
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={applyCoupon}
                        disabled={couponLoading}
                      >
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    </div>
                  )}
                </div>

                <div className="summary-calculations">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{safeGetSubtotal().toFixed(2)}</span>
                  </div>

                  {/* Show discount row when discount is applied */}
                  {discount > 0 && (
                    <div className="summary-row discount">
                      <span>Discount</span>
                      <span
                        className="discount-amount"
                        style={{ color: "green" }}
                      >
                        -₹{(discount || 0).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="summary-row">
                    <span>Tax ({taxRate || 0}%)</span>
                    <span>₹{safeGetTax().toFixed(2)}</span>
                  </div>

                  <div className="summary-row total">
                    <span>Total</span>
                    <span>₹{getFinalTotal().toFixed(2)}</span>
                  </div>

                  {/* Show savings message */}
                  {discount > 0 && (
                    <div
                      className="savings-message"
                      style={{
                        color: "green",
                        textAlign: "center",
                        padding: "10px",
                        backgroundColor: "#e8f5e9",
                        borderRadius: "5px",
                        marginTop: "10px",
                      }}
                    >
                      🎉 You're saving ₹{(discount || 0).toFixed(2)} on this
                      order!
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="btn btn-primary checkout-btn"
                  onClick={handlePayment}
                  disabled={loading || !isCafeOpen}
                >
                  {loading ? (
                    <>
                      <span className="btn-loader"></span>
                      Processing...
                    </>
                  ) : !isCafeOpen ? (
                    "Café Closed"
                  ) : (
                    <>Pay ₹{getFinalTotal().toFixed(2)}</>
                  )}
                </button>

                <div className="secure-payment-info">
                  <FiShield className="shield-icon" />
                  <div>
                    <p className="secure-text">
                      <FiCheck /> 100% Secure Payment
                    </p>
                    <p className="secure-subtext">
                      Your payment information is encrypted and secure
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
