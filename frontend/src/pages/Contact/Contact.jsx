import React, { useState } from "react";
import {
  FiCalendar,
  FiUsers,
  FiMapPin,
  FiPhone,
  FiMail,
  FiUser,
  FiClock,
  FiSend,
  FiCheck,
  FiGift,
  FiCoffee,
  FiShoppingBag,
} from "react-icons/fi";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaWhatsapp,
  FaBirthdayCake,
} from "react-icons/fa";
import { GiCakeSlice, GiPartyPopper } from "react-icons/gi";
import { contactsAPI } from "../../services/api";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import "./Contact.css";

const Contact = () => {
  const { showAlert } = useApp();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    eventType: "birthday",
    eventDate: "",
    eventTime: "",
    guestCount: "",
    venue: "pickup",
    venueAddress: "",
    preferredItems: [],
    budget: "",
    specialRequirements: "",
    message: "",
  });

  const eventTypes = [
    { value: "birthday", label: "Birthday Party", icon: <FaBirthdayCake /> },
    { value: "corporate", label: "Corporate Event", icon: <FiShoppingBag /> },
    { value: "wedding", label: "Wedding/Engagement", icon: <FiGift /> },
    { value: "anniversary", label: "Anniversary", icon: <GiPartyPopper /> },
    { value: "other", label: "Other Event", icon: <GiCakeSlice /> },
  ];

  const menuItems = [
    "Coffee Selection",
    "Tea & Beverages",
    "Pastries & Cakes",
    "Sandwiches",
    "Snacks & Appetizers",
    "Dessert Platter",
    "Breakfast Items",
    "Custom Menu",
  ];

  const budgetRanges = [
    "₹5,000 - ₹10,000",
    "₹10,000 - ₹25,000",
    "₹25,000 - ₹50,000",
    "₹50,000 - ₹1,00,000",
    "Above ₹1,00,000",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleItemToggle = (item) => {
    setFormData((prev) => ({
      ...prev,
      preferredItems: prev.preferredItems.includes(item)
        ? prev.preferredItems.filter((i) => i !== item)
        : [...prev.preferredItems, item],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.eventDate ||
      !formData.guestCount
    ) {
      showAlert("error", "Error", "Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      await contactsAPI.submitPartyOrder(formData);
      setSubmitted(true);
      showAlert(
        "success",
        "Inquiry Submitted!",
        "We will contact you within 24 hours.",
      );
    } catch (error) {
      showAlert(
        "error",
        "Error",
        error.response?.data?.message || "Failed to submit inquiry",
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="contact-page page">
        <div className="page-header">
          <div className="container">
            <h1>Party & Bulk Orders</h1>
            <p>Make your events special with Brew Haven</p>
          </div>
        </div>

        <div className="page-content">
          <div className="container">
            <div className="success-message">
              <div className="success-icon">
                <FiCheck />
              </div>
              <h2>Inquiry Submitted Successfully!</h2>
              <p>
                Thank you for choosing Brew Haven for your event. Our team will
                contact you within 24 hours to discuss your requirements.
              </p>
              <div className="success-details">
                <p>
                  <strong>Event:</strong>{" "}
                  {
                    eventTypes.find((e) => e.value === formData.eventType)
                      ?.label
                  }
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(formData.eventDate).toLocaleDateString()}
                </p>
                <p>
                  <strong>Guests:</strong> {formData.guestCount} people
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: user?.name || "",
                    email: user?.email || "",
                    phone: user?.phone || "",
                    eventType: "birthday",
                    eventDate: "",
                    eventTime: "",
                    guestCount: "",
                    venue: "pickup",
                    venueAddress: "",
                    preferredItems: [],
                    budget: "",
                    specialRequirements: "",
                    message: "",
                  });
                }}
              >
                Submit Another Inquiry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-page page">
      <div className="page-header party-header">
        <div className="container">
          <div className="party-header-content">
            <span className="party-badge">🎉 Special Events</span>
            <h1>Party & Bulk Orders</h1>
            <p>
              Planning a special event? Let us handle the refreshments! From
              intimate gatherings to large corporate events.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="party-features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaBirthdayCake />
              </div>
              <h3>Birthday Parties</h3>
              <p>Custom cakes, pastries, and beverages for your special day</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FiShoppingBag />
              </div>
              <h3>Corporate Events</h3>
              <p>
                Professional catering for meetings, conferences & office parties
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FiGift />
              </div>
              <h3>Special Occasions</h3>
              <p>Weddings, anniversaries, and milestone celebrations</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FiCoffee />
              </div>
              <h3>Bulk Orders</h3>
              <p>Large quantity orders for any occasion with special pricing</p>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section className="party-form-section">
        <div className="container">
          <div className="party-form-container">
            <div className="form-info">
              <h2>Request a Quote</h2>
              <p>
                Fill out the form and our event specialist will contact you
                within 24 hours.
              </p>

              <div className="info-highlights">
                <div className="highlight">
                  <FiCheck />
                  <span>Free consultation</span>
                </div>
                <div className="highlight">
                  <FiCheck />
                  <span>Customized menus</span>
                </div>
                <div className="highlight">
                  <FiCheck />
                  <span>Bulk discounts available</span>
                </div>
                <div className="highlight">
                  <FiCheck />
                  <span>Same day pickup available</span>
                </div>
              </div>

              <div className="contact-details">
                <h4>Quick Contact</h4>
                <p>
                  <FiPhone /> +91 98765 43210
                </p>
                <p>
                  <FiMail /> events@brewhaven.com
                </p>
                <p>
                  <FaWhatsapp /> Chat on WhatsApp
                </p>
              </div>

              <div className="social-section">
                <h4>Follow Us</h4>
                <div className="social-links">
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaFacebook />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaInstagram />
                  </a>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaTwitter />
                  </a>
                </div>
              </div>
            </div>

            <div className="form-wrapper">
              <form className="party-form" onSubmit={handleSubmit}>
                {/* Personal Details */}
                <div className="form-section">
                  <h3>
                    <FiUser /> Your Details
                  </h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        className="form-control"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Event Details */}
                <div className="form-section">
                  <h3>
                    <GiPartyPopper /> Event Details
                  </h3>

                  <div className="form-group">
                    <label>Event Type *</label>
                    <div className="event-type-grid">
                      {eventTypes.map((type) => (
                        <label
                          key={type.value}
                          className={`event-type-option ${formData.eventType === type.value ? "selected" : ""}`}
                        >
                          <input
                            type="radio"
                            name="eventType"
                            value={type.value}
                            checked={formData.eventType === type.value}
                            onChange={handleChange}
                          />
                          <span className="event-icon">{type.icon}</span>
                          <span className="event-label">{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <FiCalendar /> Event Date *
                      </label>
                      <input
                        type="date"
                        name="eventDate"
                        className="form-control"
                        value={formData.eventDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>
                        <FiClock /> Event Time
                      </label>
                      <input
                        type="time"
                        name="eventTime"
                        className="form-control"
                        value={formData.eventTime}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <FiUsers /> Number of Guests *
                      </label>
                      <input
                        type="number"
                        name="guestCount"
                        className="form-control"
                        placeholder="Expected guests"
                        value={formData.guestCount}
                        onChange={handleChange}
                        min="10"
                        required
                      />
                      <small>Minimum 10 guests for party orders</small>
                    </div>
                    <div className="form-group">
                      <label>Estimated Budget</label>
                      <select
                        name="budget"
                        className="form-control"
                        value={formData.budget}
                        onChange={handleChange}
                      >
                        <option value="">Select budget range</option>
                        {budgetRanges.map((range) => (
                          <option key={range} value={range}>
                            {range}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Venue Details */}
                <div className="form-section">
                  <h3>
                    <FiMapPin /> Pickup/Delivery
                  </h3>
                  <div className="form-group">
                    <label>How would you like to receive your order?</label>
                    <div className="venue-options">
                      <label
                        className={`venue-option ${formData.venue === "pickup" ? "selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name="venue"
                          value="pickup"
                          checked={formData.venue === "pickup"}
                          onChange={handleChange}
                        />
                        <FiShoppingBag />
                        <span>Pickup from Café</span>
                      </label>
                      <label
                        className={`venue-option ${formData.venue === "delivery" ? "selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name="venue"
                          value="delivery"
                          checked={formData.venue === "delivery"}
                          onChange={handleChange}
                        />
                        <FiMapPin />
                        <span>Delivery to Location</span>
                      </label>
                      <label
                        className={`venue-option ${formData.venue === "at_cafe" ? "selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name="venue"
                          value="at_cafe"
                          checked={formData.venue === "at_cafe"}
                          onChange={handleChange}
                        />
                        <FiCoffee />
                        <span>Event at Café</span>
                      </label>
                    </div>
                  </div>

                  {formData.venue === "delivery" && (
                    <div className="form-group">
                      <label>Delivery Address</label>
                      <textarea
                        name="venueAddress"
                        className="form-control"
                        placeholder="Enter complete delivery address"
                        value={formData.venueAddress}
                        onChange={handleChange}
                        rows="2"
                      />
                    </div>
                  )}
                </div>

                {/* Menu Preferences */}
                <div className="form-section">
                  <h3>
                    <FiCoffee /> Menu Preferences
                  </h3>
                  <div className="form-group">
                    <label>Select items you're interested in:</label>
                    <div className="menu-items-grid">
                      {menuItems.map((item) => (
                        <label
                          key={item}
                          className={`menu-item-option ${formData.preferredItems.includes(item) ? "selected" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.preferredItems.includes(item)}
                            onChange={() => handleItemToggle(item)}
                          />
                          <span>{item}</span>
                          {formData.preferredItems.includes(item) && (
                            <FiCheck className="check-icon" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="form-section">
                  <h3>Additional Information</h3>
                  <div className="form-group">
                    <label>Special Requirements / Dietary Restrictions</label>
                    <textarea
                      name="specialRequirements"
                      className="form-control"
                      placeholder="E.g., Vegetarian only, No nuts, Sugar-free options, etc."
                      value={formData.specialRequirements}
                      onChange={handleChange}
                      rows="2"
                    />
                  </div>
                  <div className="form-group">
                    <label>Any other message for us?</label>
                    <textarea
                      name="message"
                      className="form-control"
                      placeholder="Tell us more about your event..."
                      value={formData.message}
                      onChange={handleChange}
                      rows="3"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="btn-spinner"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FiSend /> Submit Inquiry
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="party-faq">
        <div className="container">
          <div className="section-title">
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>How far in advance should I place my order?</h4>
              <p>
                We recommend placing orders at least 3-5 days in advance. For
                large events (50+ guests), please order 1-2 weeks ahead.
              </p>
            </div>
            <div className="faq-item">
              <h4>Is there a minimum order for bulk/party orders?</h4>
              <p>
                Yes, minimum order is for 10 guests. For corporate events,
                minimum order value is ₹5,000.
              </p>
            </div>
            <div className="faq-item">
              <h4>Do you offer delivery for party orders?</h4>
              <p>
                Yes! We offer delivery within city limits. Delivery charges vary
                based on distance and order size.
              </p>
            </div>
            <div className="faq-item">
              <h4>Can I customize the menu?</h4>
              <p>
                Absolutely! We offer complete menu customization. Our team will
                work with you to create the perfect spread.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
