import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import StarRating from "../StarRating/StarRating";
import "./ReviewForm.css";

const ReviewForm = ({
  product,
  orderId,
  onSubmit,
  onCancel,
  existingReview = null,
}) => {
  const [formData, setFormData] = useState({
    rating: existingReview?.rating || 0,
    title: existingReview?.title || "",
    comment: existingReview?.comment || "",
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (formData.rating === 0) newErrors.rating = "Please select a rating";
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.comment.trim()) newErrors.comment = "Review is required";
    if (formData.comment.length > 500)
      newErrors.comment = "Review cannot exceed 500 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        productId: product._id,
        orderId,
      });
    }
  };

  return (
    <div className="review-form-container">
      <div className="review-form-header">
        <h3>{existingReview ? "Edit Review" : "Write a Review"}</h3>
        <button className="close-btn" onClick={onCancel}>
          <FiX />
        </button>
      </div>

      <div className="review-product-info">
        <img src={product.image} alt={product.name} />
        <div>
          <h4>{product.name}</h4>
          <p>{product.description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="review-form">
        <div className="form-group">
          <label>
            Your Rating <span className="required">*</span>
          </label>
          <StarRating
            rating={formData.rating}
            size="large"
            interactive
            onRate={(rating) => setFormData({ ...formData, rating })}
          />
          {errors.rating && <span className="error">{errors.rating}</span>}
        </div>

        <div className="form-group">
          <label>
            Review Title <span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Summarize your experience"
            maxLength={100}
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <small>{formData.title.length}/100 characters</small>
          {errors.title && <span className="error">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label>
            Your Review <span className="required">*</span>
          </label>
          <textarea
            className="form-control"
            placeholder="Share your experience with this product..."
            rows="5"
            maxLength={500}
            value={formData.comment}
            onChange={(e) =>
              setFormData({ ...formData, comment: e.target.value })
            }
          />
          <small>{formData.comment.length}/500 characters</small>
          {errors.comment && <span className="error">{errors.comment}</span>}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {existingReview ? "Update Review" : "Submit Review"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
