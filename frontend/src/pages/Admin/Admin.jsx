import React, { useState, useEffect } from "react";
import {
  FiPercent,
  FiStar,
  FiMenu,
  FiX,
  FiRefreshCw,
  FiEdit,
  FiExternalLink,
} from "react-icons/fi";
import {
  FiGrid,
  FiShoppingBag,
  FiPackage,
  FiLayers,
  FiUsers,
  FiMail,
  FiSettings,
  FiLogOut,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import {
  ordersAPI,
  productsAPI,
  categoriesAPI,
  contactsAPI,
  adminAPI,
  couponsAPI,
  reviewsAPI,
} from "../../services/api";
import Loader from "../../components/Loader/Loader";
import Modal from "../../components/Modal/Modal";
import "./Admin.css";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState({});
  const [coupons, setCoupons] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [showReviewResponseModal, setShowReviewResponseModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");

  // ✅ MOBILE SIDEBAR STATE
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { logout } = useAuth();
  const { showAlert, setSettings: setAppSettings } = useApp();
  const navigate = useNavigate();

  // Product form state
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    stock: 100,
    isAvailable: true,
    featured: false,
  });

  // Coupon form state
  const [couponForm, setCouponForm] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: 0,
    maxDiscount: "",
    usageLimit: "",
    perUserLimit: 1,
    validFrom: new Date().toISOString().split("T")[0],
    validUntil: "",
    isActive: true,
  });

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    image: "",
    isActive: true,
  });

  // ✅ CHECK MOBILE ON RESIZE
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ PREVENT BODY SCROLL WHEN SIDEBAR OPEN
  useEffect(() => {
    if (sidebarOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen, isMobile]);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case "dashboard":
          const [statsRes, ordersRes] = await Promise.all([
            ordersAPI.getStats(),
            ordersAPI.getAll({ status: "pending" }),
          ]);
          setStats(statsRes.data);
          setOrders(ordersRes.data.slice(0, 5));
          break;
        case "orders":
          const allOrders = await ordersAPI.getAll();
          setOrders(allOrders.data);
          break;
        case "products":
          const [productsRes, catsForProducts] = await Promise.all([
            productsAPI.getAllAdmin(),
            categoriesAPI.getAllAdmin(),
          ]);
          setProducts(productsRes.data);
          setCategories(catsForProducts.data);
          break;
        case "categories":
          const catsRes = await categoriesAPI.getAllAdmin();
          setCategories(catsRes.data);
          break;
        case "users":
          const usersRes = await adminAPI.getUsers();
          setUsers(usersRes.data);
          break;
        case "messages":
          const messagesRes = await contactsAPI.getAll();
          setContacts(messagesRes.data);
          break;
        case "settings":
          const settingsRes = await adminAPI.getSettings();
          setSettings(settingsRes.data);
          break;
        case "coupons":
          const couponsRes = await couponsAPI.getAll();
          setCoupons(couponsRes.data);
          break;
        case "reviews":
          const reviewsRes = await reviewsAPI.getAllReviews();
          setReviews(reviewsRes.data);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ TOGGLE SIDEBAR FUNCTION
  const toggleSidebar = () => {
    console.log("Toggle sidebar clicked, current state:", sidebarOpen);
    setSidebarOpen(!sidebarOpen);
  };

  // ✅ CLOSE SIDEBAR FUNCTION
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // ✅ HANDLE TAB CHANGE - CLOSE SIDEBAR ON MOBILE
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Pull to refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
    showAlert("success", "Refreshed", "Data updated successfully");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Product handlers
  const openProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category?._id || "",
        image: product.image,
        stock: product.stock,
        isAvailable: product.isAvailable,
        featured: product.featured,
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
        stock: 100,
        isAvailable: true,
        featured: false,
      });
    }
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productsAPI.update(editingProduct._id, productForm);
        showAlert("success", "Success", "Product updated successfully");
      } else {
        await productsAPI.create(productForm);
        showAlert("success", "Success", "Product created successfully");
      }
      setShowProductModal(false);
      fetchData();
    } catch (error) {
      showAlert(
        "error",
        "Error",
        error.response?.data?.message || "Operation failed",
      );
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await productsAPI.delete(id);
        showAlert("success", "Success", "Product deleted successfully");
        fetchData();
      } catch (error) {
        showAlert("error", "Error", "Failed to delete product");
      }
    }
  };

  // Category handlers
  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || "",
        image: category.image || "",
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: "",
        description: "",
        image: "",
        isActive: true,
      });
    }
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoriesAPI.update(editingCategory._id, categoryForm);
        showAlert("success", "Success", "Category updated successfully");
      } else {
        await categoriesAPI.create(categoryForm);
        showAlert("success", "Success", "Category created successfully");
      }
      setShowCategoryModal(false);
      fetchData();
    } catch (error) {
      showAlert(
        "error",
        "Error",
        error.response?.data?.message || "Operation failed",
      );
    }
  };

  const deleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await categoriesAPI.delete(id);
        showAlert("success", "Success", "Category deleted successfully");
        fetchData();
      } catch (error) {
        showAlert("error", "Error", "Failed to delete category");
      }
    }
  };

  // Coupon handlers
  const openCouponModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setCouponForm({
        code: coupon.code,
        description: coupon.description || "",
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscount: coupon.maxDiscount || "",
        usageLimit: coupon.usageLimit || "",
        perUserLimit: coupon.perUserLimit,
        validFrom: coupon.validFrom?.split("T")[0],
        validUntil: coupon.validUntil?.split("T")[0],
        isActive: coupon.isActive,
      });
    } else {
      setEditingCoupon(null);
      setCouponForm({
        code: "",
        description: "",
        discountType: "percentage",
        discountValue: "",
        minOrderAmount: 0,
        maxDiscount: "",
        usageLimit: "",
        perUserLimit: 1,
        validFrom: new Date().toISOString().split("T")[0],
        validUntil: "",
        isActive: true,
      });
    }
    setShowCouponModal(true);
  };

  const handleCouponSubmit = async () => {
    try {
      if (editingCoupon) {
        await couponsAPI.update(editingCoupon._id, couponForm);
        showAlert("success", "Success", "Coupon updated successfully");
      } else {
        await couponsAPI.create(couponForm);
        showAlert("success", "Success", "Coupon created successfully");
      }
      setShowCouponModal(false);
      fetchData();
    } catch (error) {
      showAlert(
        "error",
        "Error",
        error.response?.data?.message || "Operation failed",
      );
    }
  };

  const deleteCoupon = async (id) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      try {
        await couponsAPI.delete(id);
        showAlert("success", "Success", "Coupon deleted successfully");
        fetchData();
      } catch (error) {
        showAlert("error", "Error", "Failed to delete coupon");
      }
    }
  };

  // Order handlers
  const updateOrderStatus = async (orderId, status) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      showAlert("success", "Success", "Order status updated");
      fetchData();
    } catch (error) {
      showAlert("error", "Error", "Failed to update order");
    }
  };

  const viewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  // Settings handler
  const handleSettingsChange = async (field, value) => {
    try {
      const updatedSettings = { ...settings, [field]: value };
      await adminAPI.updateSettings(updatedSettings);
      setSettings(updatedSettings);
      if (setAppSettings) {
        setAppSettings(updatedSettings);
      }
      showAlert("success", "Success", "Settings updated");
    } catch (error) {
      showAlert("error", "Error", "Failed to update settings");
    }
  };

  // Message handlers
  const markMessageAsRead = async (id) => {
    try {
      await contactsAPI.markAsRead(id);
      fetchData();
    } catch (error) {
      console.error("Failed to mark as read");
    }
  };

  const deleteMessage = async (id) => {
    if (window.confirm("Delete this message?")) {
      try {
        await contactsAPI.delete(id);
        showAlert("success", "Success", "Message deleted");
        fetchData();
      } catch (error) {
        showAlert("error", "Error", "Failed to delete message");
      }
    }
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

  // Get tab title for mobile header

  const getTabTitle = () => {
    const titles = {
      dashboard: "Dashboard",
      orders: "Orders",
      products: "Products",
      categories: "Categories",
      users: "Users",
      messages: "Messages",
      settings: "Settings",
      coupons: "Coupons",
      reviews: "Reviews",
    };
    return titles[activeTab] || "Admin";
  };

  return (
    <div className="admin-page">
      {/* ✅ MOBILE HEADER - Only shows on mobile */}
      <header className="admin-mobile-header">
        <button
          className="mobile-menu-btn"
          onClick={toggleSidebar}
          type="button"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        <h1 className="mobile-title">{getTabTitle()}</h1>

        {/* ✅ ADD VIEW STORE BUTTON */}
        <button
          className="view-store-btn"
          onClick={() => window.open("/")}
          type="button"
          aria-label="View Store"
          title="View Store"
        >
          <FiExternalLink size={20} />
        </button>

        <button
          className={`refresh-btn ${isRefreshing ? "refreshing" : ""}`}
          onClick={handleRefresh}
          disabled={isRefreshing}
          type="button"
          aria-label="Refresh"
        >
          <FiRefreshCw size={20} />
        </button>
      </header>

      {/* ✅ OVERLAY - Closes sidebar when clicked */}
      {sidebarOpen && isMobile && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      <div className="admin-container">
        <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="admin-logo">
            <h2>☕ Brew Haven</h2>
            <p>Admin Panel</p>
          </div>
          <button
            className="view-store-sidebar-btn"
            onClick={() => window.open("/", "_blank")}
            type="button"
          >
            <FiExternalLink className="icon" />
            <span>View Store</span>
          </button>
          <nav className="admin-menu">
            <button
              className={activeTab === "dashboard" ? "active" : ""}
              onClick={() => handleTabChange("dashboard")}
              type="button"
            >
              <FiGrid className="icon" />
              <span>Dashboard</span>
            </button>
            <button
              className={activeTab === "reviews" ? "active" : ""}
              onClick={() => handleTabChange("reviews")}
              type="button"
            >
              <FiStar className="icon" />
              <span>Reviews</span>
            </button>
            <button
              className={activeTab === "coupons" ? "active" : ""}
              onClick={() => handleTabChange("coupons")}
              type="button"
            >
              <FiPercent className="icon" />
              <span>Coupons</span>
            </button>
            <button
              className={activeTab === "orders" ? "active" : ""}
              onClick={() => handleTabChange("orders")}
              type="button"
            >
              <FiShoppingBag className="icon" />
              <span>Orders</span>
            </button>
            <button
              className={activeTab === "products" ? "active" : ""}
              onClick={() => handleTabChange("products")}
              type="button"
            >
              <FiPackage className="icon" />
              <span>Products</span>
            </button>
            <button
              className={activeTab === "categories" ? "active" : ""}
              onClick={() => handleTabChange("categories")}
              type="button"
            >
              <FiLayers className="icon" />
              <span>Categories</span>
            </button>
            <button
              className={activeTab === "users" ? "active" : ""}
              onClick={() => handleTabChange("users")}
              type="button"
            >
              <FiUsers className="icon" />
              <span>Users</span>
            </button>
            <button
              className={activeTab === "messages" ? "active" : ""}
              onClick={() => handleTabChange("messages")}
              type="button"
            >
              <FiMail className="icon" />
              <span>Messages</span>
            </button>
            <button
              className={activeTab === "settings" ? "active" : ""}
              onClick={() => handleTabChange("settings")}
              type="button"
            >
              <FiSettings className="icon" />
              <span>Settings</span>
            </button>
            <button onClick={handleLogout} className="logout-btn" type="button">
              <FiLogOut className="icon" />
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        {/* ✅ MAIN CONTENT */}
        <main className="admin-main">
          {loading ? (
            <div className="admin-loader">
              <Loader text="Loading..." />
            </div>
          ) : (
            <>
              {/* Dashboard Tab */}
              {activeTab === "dashboard" && (
                <>
                  <div className="admin-header">
                    <h1>Dashboard</h1>
                  </div>

                  <div className="admin-stats">
                    <div className="stat-card orders">
                      <div className="stat-icon">
                        <FiShoppingBag />
                      </div>
                      <div className="stat-info">
                        <h3>{stats.totalOrders || 0}</h3>
                        <p>Total Orders</p>
                      </div>
                    </div>
                    <div className="stat-card revenue">
                      <div className="stat-icon">₹</div>
                      <div className="stat-info">
                        <h3>₹{(stats.totalRevenue || 0).toFixed(2)}</h3>
                        <p>Total Revenue</p>
                      </div>
                    </div>
                    <div className="stat-card pending">
                      <div className="stat-icon">
                        <FiPackage />
                      </div>
                      <div className="stat-info">
                        <h3>{stats.pendingOrders || 0}</h3>
                        <p>Pending Orders</p>
                      </div>
                    </div>
                    <div className="stat-card delivered">
                      <div className="stat-icon">
                        <FiLayers />
                      </div>
                      <div className="stat-info">
                        <h3>{stats.deliveredOrders || 0}</h3>
                        <p>Delivered</p>
                      </div>
                    </div>
                  </div>

                  <div className="admin-panel">
                    <div className="panel-header">
                      <h2>Recent Orders</h2>
                    </div>
                    <div className="panel-body">
                      {orders.length > 0 ? (
                        <div className="table-wrapper">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orders.map((order) => (
                                <tr key={order._id}>
                                  <td>#{order._id.slice(-8).toUpperCase()}</td>
                                  <td>{order.user?.name}</td>
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
                                  <td>
                                    <button
                                      className="action-btn edit"
                                      onClick={() => viewOrder(order)}
                                    >
                                      <FiEye />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="empty-state">
                          <FiShoppingBag className="empty-icon" />
                          <p>No recent orders</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <>
                  <div className="admin-header">
                    <h1>Reviews Management</h1>
                  </div>

                  <div className="admin-panel">
                    <div className="panel-body">
                      {reviews.length > 0 ? (
                        <div className="table-wrapper">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Product</th>
                                <th>User</th>
                                <th>Rating</th>
                                <th>Review</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {reviews.map((review) => (
                                <tr key={review._id}>
                                  <td>{review.product?.name}</td>
                                  <td>
                                    {review.user?.name}
                                    <br />
                                    <small>{review.user?.email}</small>
                                  </td>
                                  <td>
                                    <div className="rating-display">
                                      <FiStar className="star-icon" />
                                      {review.rating}
                                    </div>
                                  </td>
                                  <td>
                                    <strong>{review.title}</strong>
                                    <br />
                                    <small>
                                      {review.comment.substring(0, 50)}...
                                    </small>
                                  </td>
                                  <td>{formatDate(review.createdAt)}</td>
                                  <td>
                                    <label className="toggle-switch">
                                      <input
                                        type="checkbox"
                                        checked={review.isApproved}
                                        onChange={async () => {
                                          await reviewsAPI.approveReview(
                                            review._id,
                                            !review.isApproved,
                                          );
                                          fetchData();
                                        }}
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                  </td>
                                  <td>
                                    <div className="action-btns">
                                      <button
                                        className="action-btn edit"
                                        onClick={() => {
                                          setSelectedReview(review);
                                          setResponseMessage(
                                            review.adminResponse?.message || "",
                                          );
                                          setShowReviewResponseModal(true);
                                        }}
                                        title="Respond"
                                      >
                                        Res
                                      </button>
                                      <button
                                        className="action-btn delete"
                                        onClick={async () => {
                                          if (
                                            window.confirm(
                                              "Delete this review?",
                                            )
                                          ) {
                                            await reviewsAPI.deleteReview(
                                              review._id,
                                            );
                                            showAlert(
                                              "success",
                                              "Deleted",
                                              "Review deleted",
                                            );
                                            fetchData();
                                          }
                                        }}
                                        title="Delete"
                                      >
                                        Del
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="empty-state">
                          <FiStar className="empty-icon" />
                          <p>No reviews found</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Coupons Tab */}
              {activeTab === "coupons" && (
                <>
                  <div className="admin-header">
                    <h1>Coupon Management</h1>
                    <button
                      className="btn btn-primary"
                      onClick={() => openCouponModal()}
                    >
                      <FiPlus /> Add Coupon
                    </button>
                  </div>

                  <div className="admin-panel">
                    <div className="panel-body">
                      {coupons.length > 0 ? (
                        <div className="table-wrapper">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Code</th>
                                <th>Discount</th>
                                <th>Min Order</th>
                                <th>Usage</th>
                                <th>Valid Until</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {coupons.map((coupon) => (
                                <tr key={coupon._id}>
                                  <td>
                                    <strong>{coupon.code}</strong>
                                    {coupon.description && (
                                      <small className="text-muted">
                                        <br />
                                        {coupon.description}
                                      </small>
                                    )}
                                  </td>
                                  <td>
                                    {coupon.discountType === "percentage"
                                      ? `${coupon.discountValue}%`
                                      : `₹${coupon.discountValue}`}
                                  </td>
                                  <td>₹{coupon.minOrderAmount}</td>
                                  <td>
                                    {coupon.usedCount || 0} /{" "}
                                    {coupon.usageLimit || "∞"}
                                  </td>
                                  <td>
                                    {new Date(
                                      coupon.validUntil,
                                    ).toLocaleDateString()}
                                  </td>
                                  <td>
                                    <label className="toggle-switch">
                                      <input
                                        type="checkbox"
                                        checked={coupon.isActive}
                                        onChange={async () => {
                                          await couponsAPI.toggle(coupon._id);
                                          fetchData();
                                        }}
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                  </td>
                                  <td>
                                    <div className="action-btns">
                                      <button
                                        className="action-btn edit"
                                        onClick={() => openCouponModal(coupon)}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        className="action-btn delete"
                                        onClick={() => deleteCoupon(coupon._id)}
                                      >
                                        Del
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="empty-state">
                          <FiPercent className="empty-icon" />
                          <p>No coupons found</p>
                          <button
                            className="btn btn-primary"
                            onClick={() => openCouponModal()}
                          >
                            <FiPlus /> Create Coupon
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <>
                  <div className="admin-header">
                    <h1>Orders Management</h1>
                  </div>

                  <div className="admin-panel">
                    <div className="panel-body">
                      {orders.length > 0 ? (
                        <div className="table-wrapper">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orders.map((order) => (
                                <tr key={order._id}>
                                  <td>#{order._id.slice(-8).toUpperCase()}</td>
                                  <td>
                                    {order.user?.name}
                                    <br />
                                    <small>{order.user?.email}</small>
                                  </td>
                                  <td>{formatDate(order.createdAt)}</td>
                                  <td>{order.items.length} items</td>
                                  <td>₹{order.total.toFixed(2)}</td>
                                  <td>
                                    <select
                                      value={order.orderStatus}
                                      onChange={(e) =>
                                        updateOrderStatus(
                                          order._id,
                                          e.target.value,
                                        )
                                      }
                                      className="status-select"
                                    >
                                      <option value="pending">Pending</option>
                                      <option value="confirmed">
                                        Confirmed
                                      </option>
                                      <option value="preparing">
                                        Preparing
                                      </option>
                                      <option value="ready">Ready</option>
                                      <option value="delivered">
                                        Delivered
                                      </option>
                                      <option value="cancelled">
                                        Cancelled
                                      </option>
                                    </select>
                                  </td>
                                  <td>
                                    <button
                                      className="action-btn edit"
                                      onClick={() => viewOrder(order)}
                                    >
                                      See
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="empty-state">
                          <FiShoppingBag className="empty-icon" />
                          <p>No orders found</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Products Tab */}
              {activeTab === "products" && (
                <>
                  <div className="admin-header">
                    <h1>Products Management</h1>
                    <button
                      className="btn btn-primary"
                      onClick={() => openProductModal()}
                    >
                      <FiPlus /> Add Product
                    </button>
                  </div>

                  <div className="admin-panel">
                    <div className="panel-body">
                      {products.length > 0 ? (
                        <div className="table-wrapper">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {products.map((product) => (
                                <tr key={product._id}>
                                  <td>
                                    <img
                                      src={
                                        product.image ||
                                        "https://via.placeholder.com/50"
                                      }
                                      alt={product.name}
                                      className="product-img"
                                    />
                                  </td>
                                  <td>{product.name}</td>
                                  <td>{product.category?.name}</td>
                                  <td>₹{product.price.toFixed(2)}</td>
                                  <td>{product.stock}</td>
                                  <td>
                                    <label className="toggle-switch">
                                      <input
                                        type="checkbox"
                                        checked={product.isAvailable}
                                        onChange={() => {
                                          productsAPI
                                            .update(product._id, {
                                              isAvailable: !product.isAvailable,
                                            })
                                            .then(fetchData);
                                        }}
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                  </td>
                                  <td>
                                    <div className="action-btns">
                                      <button
                                        className="action-btn edit"
                                        onClick={() =>
                                          openProductModal(product)
                                        }
                                      >
                                        Edit
                                      </button>
                                      <button
                                        className="action-btn delete"
                                        onClick={() =>
                                          deleteProduct(product._id)
                                        }
                                      >
                                        Del
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="empty-state">
                          <FiPackage className="empty-icon" />
                          <p>No products found</p>
                          <button
                            className="btn btn-primary"
                            onClick={() => openProductModal()}
                          >
                            <FiPlus /> Add Product
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Categories Tab */}
              {activeTab === "categories" && (
                <>
                  <div className="admin-header">
                    <h1>Categories Management</h1>
                    <button
                      className="btn btn-primary"
                      onClick={() => openCategoryModal()}
                    >
                      <FiPlus /> Add Category
                    </button>
                  </div>

                  <div className="admin-panel">
                    <div className="panel-body">
                      {categories.length > 0 ? (
                        <div className="table-wrapper">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {categories.map((category) => (
                                <tr key={category._id}>
                                  <td>
                                    <img
                                      src={
                                        category.image ||
                                        "https://via.placeholder.com/50"
                                      }
                                      alt={category.name}
                                      className="product-img"
                                    />
                                  </td>
                                  <td>{category.name}</td>
                                  <td>{category.description || "-"}</td>
                                  <td>
                                    <label className="toggle-switch">
                                      <input
                                        type="checkbox"
                                        checked={category.isActive}
                                        onChange={() => {
                                          categoriesAPI
                                            .update(category._id, {
                                              isActive: !category.isActive,
                                            })
                                            .then(fetchData);
                                        }}
                                      />
                                      <span className="toggle-slider"></span>
                                    </label>
                                  </td>
                                  <td>
                                    <div className="action-btns">
                                      <button
                                        className="action-btn edit"
                                        onClick={() =>
                                          openCategoryModal(category)
                                        }
                                      >
                                        Edit
                                      </button>
                                      <button
                                        className="action-btn delete"
                                        onClick={() =>
                                          deleteCategory(category._id)
                                        }
                                      >
                                        Del
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="empty-state">
                          <FiLayers className="empty-icon" />
                          <p>No categories found</p>
                          <button
                            className="btn btn-primary"
                            onClick={() => openCategoryModal()}
                          >
                            <FiPlus /> Add Category
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <>
                  <div className="admin-header">
                    <h1>Users Management</h1>
                  </div>

                  <div className="admin-panel">
                    <div className="panel-body">
                      {users.length > 0 ? (
                        <div className="table-wrapper">
                          <table className="admin-table">
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Joined</th>
                              </tr>
                            </thead>
                            <tbody>
                              {users.map((user) => (
                                <tr key={user._id}>
                                  <td>{user.name}</td>
                                  <td>{user.email}</td>
                                  <td>{user.phone || "-"}</td>
                                  <td>
                                    <span
                                      className={`badge ${
                                        user.role === "admin"
                                          ? "badge-warning"
                                          : "badge-info"
                                      }`}
                                    >
                                      {user.role}
                                    </span>
                                  </td>
                                  <td>{formatDate(user.createdAt)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="empty-state">
                          <FiUsers className="empty-icon" />
                          <p>No users found</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Messages Tab */}
              {activeTab === "messages" && (
                <>
                  <div className="admin-header">
                    <h1>Contact Messages</h1>
                  </div>

                  <div className="admin-panel">
                    <div className="panel-body">
                      {contacts.length > 0 ? (
                        <div className="messages-container">
                          {contacts.map((contact) => (
                            <div key={contact._id} className="message-card">
                              <div className="message-header">
                                <h3>{contact.name || "-"}</h3>
                                <span
                                  className={`badge ${
                                    contact.isRead
                                      ? "badge-success"
                                      : "badge-warning"
                                  }`}
                                >
                                  {contact.isRead ? "Read" : "Unread"}
                                </span>
                              </div>

                              <div className="message-body">
                                <p>
                                  <strong>Email:</strong>{" "}
                                  <span>{contact.email || "-"}</span>
                                </p>

                                <p>
                                  <strong>Phone:</strong>{" "}
                                  <span>{contact.phone || "-"}</span>
                                </p>

                                <p>
                                  <strong>Event Type:</strong>{" "}
                                  <span>{contact.eventType || "-"}</span>
                                </p>

                                <p>
                                  <strong>Event Date:</strong>{" "}
                                  <span>
                                    {contact.eventDate
                                      ? formatDate(contact.eventDate)
                                      : "-"}
                                  </span>
                                </p>

                                <p>
                                  <strong>Event Time:</strong>{" "}
                                  <span>{contact.eventTime || "-"}</span>
                                </p>

                                <p>
                                  <strong>Guest Count:</strong>{" "}
                                  <span>{contact.guestCount || "-"}</span>
                                </p>

                                <p>
                                  <strong>Venue:</strong>{" "}
                                  <span>{contact.venue || "-"}</span>
                                </p>

                                <p>
                                  <strong>Venue Address:</strong>{" "}
                                  <span>{contact.venueAddress || "-"}</span>
                                </p>

                                <p>
                                  <strong>Preferred Items:</strong>{" "}
                                  <span>
                                    {contact.preferredItems?.length > 0
                                      ? contact.preferredItems.join(", ")
                                      : "-"}
                                  </span>
                                </p>

                                <p>
                                  <strong>Budget:</strong>{" "}
                                  <span>{contact.budget || "-"}</span>
                                </p>

                                <p>
                                  <strong>Special Requirements:</strong>{" "}
                                  <span>
                                    {contact.specialRequirements || "-"}
                                  </span>
                                </p>

                                <p>
                                  <strong>Message:</strong>{" "}
                                  <span>{contact.message || "-"}</span>
                                </p>

                                <p>
                                  <strong>Status:</strong>{" "}
                                  <span>{contact.status || "-"}</span>
                                </p>

                                <p>
                                  <strong>Created:</strong>{" "}
                                  <span>{formatDate(contact.createdAt)}</span>
                                </p>
                              </div>

                              <div className="message-actions">
                                {!contact.isRead && (
                                  <button
                                    className="action-btn edit"
                                    onClick={() =>
                                      markMessageAsRead(contact._id)
                                    }
                                  >
                                    Mark Read
                                  </button>
                                )}

                                <button
                                  className="action-btn delete"
                                  onClick={() => deleteMessage(contact._id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="empty-state">
                          <FiMail className="empty-icon" />
                          <p>No messages found</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <>
                  <div className="admin-header">
                    <h1>Café Settings</h1>
                  </div>

                  <div className="admin-panel">
                    <div className="panel-body">
                      {/* Shop Status Section */}
                      <div className="settings-section">
                        <h3>🏪 Shop Status</h3>
                        <div className="setting-item">
                          <div className="setting-info">
                            <h4>Shop Open/Close</h4>
                            <p>Manually open or close the shop</p>
                          </div>
                          <div className="shop-toggle">
                            <label className="toggle-switch large">
                              <input
                                type="checkbox"
                                checked={settings.cafeOpen}
                                onChange={() =>
                                  handleSettingsChange(
                                    "cafeOpen",
                                    !settings.cafeOpen,
                                  )
                                }
                              />
                              <span className="toggle-slider"></span>
                            </label>
                            <span
                              className={`status-text ${
                                settings.cafeOpen ? "open" : "closed"
                              }`}
                            >
                              {settings.cafeOpen ? "🟢 OPEN" : "🔴 CLOSED"}
                            </span>
                          </div>
                        </div>

                        <div className="setting-item">
                          <div className="setting-info">
                            <h4>Auto Open/Close by Time</h4>
                            <p>Automatically manage based on hours</p>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={settings.autoOpenClose}
                              onChange={() =>
                                handleSettingsChange(
                                  "autoOpenClose",
                                  !settings.autoOpenClose,
                                )
                              }
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      </div>

                      {/* Business Hours Section */}
                      <div className="settings-section">
                        <h3>🕐 Business Hours</h3>
                        <div className="time-settings">
                          <div className="setting-item">
                            <div className="setting-info">
                              <h4>Opening Time</h4>
                            </div>
                            <input
                              type="time"
                              className="form-control time-input"
                              value={settings.openTime || "10:00"}
                              onChange={(e) =>
                                handleSettingsChange("openTime", e.target.value)
                              }
                            />
                          </div>
                          <div className="setting-item">
                            <div className="setting-info">
                              <h4>Closing Time</h4>
                            </div>
                            <input
                              type="time"
                              className="form-control time-input"
                              value={settings.closeTime || "22:00"}
                              onChange={(e) =>
                                handleSettingsChange(
                                  "closeTime",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Order Settings Section */}
                      <div className="settings-section">
                        <h3>📦 Order Settings</h3>
                        <div className="setting-item">
                          <div className="setting-info">
                            <h4>Order Type</h4>
                            <p>How customers receive orders</p>
                          </div>
                          <select
                            className="form-control select-input"
                            value={settings.orderType || "pickup"}
                            onChange={(e) =>
                              handleSettingsChange("orderType", e.target.value)
                            }
                          >
                            <option value="pickup">Counter Pickup</option>
                            <option value="delivery">Delivery Only</option>
                            <option value="both">Both</option>
                          </select>
                        </div>

                        <div className="setting-item">
                          <div className="setting-info">
                            <h4>Tax Rate (GST %)</h4>
                            <p>Tax applied to orders</p>
                          </div>
                          <input
                            type="number"
                            className="form-control setting-input"
                            value={settings.taxRate || 18}
                            onChange={(e) =>
                              handleSettingsChange(
                                "taxRate",
                                parseFloat(e.target.value),
                              )
                            }
                            min="0"
                            max="30"
                          />
                        </div>
                      </div>

                      {/* Messages Section */}
                      <div className="settings-section">
                        <h3>💬 Customer Messages</h3>
                        <div className="setting-item full-width">
                          <div className="setting-info">
                            <h4>Pickup Message</h4>
                          </div>
                          <textarea
                            className="form-control"
                            placeholder="Message about order pickup..."
                            value={settings.pickupMessage || ""}
                            onChange={(e) =>
                              handleSettingsChange(
                                "pickupMessage",
                                e.target.value,
                              )
                            }
                            rows="2"
                          />
                        </div>

                        <div className="setting-item full-width">
                          <div className="setting-info">
                            <h4>Closed Message</h4>
                          </div>
                          <textarea
                            className="form-control"
                            placeholder="Message when café is closed..."
                            value={settings.closedMessage || ""}
                            onChange={(e) =>
                              handleSettingsChange(
                                "closedMessage",
                                e.target.value,
                              )
                            }
                            rows="2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* All Modals remain the same */}
      {/* Review Response Modal */}
      <Modal
        isOpen={showReviewResponseModal}
        onClose={() => setShowReviewResponseModal(false)}
        title="Respond to Review"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setShowReviewResponseModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={async () => {
                try {
                  await reviewsAPI.respondToReview(
                    selectedReview._id,
                    responseMessage,
                  );
                  showAlert("success", "Success", "Response submitted");
                  setShowReviewResponseModal(false);
                  fetchData();
                } catch (error) {
                  showAlert("error", "Error", "Failed to submit response");
                }
              }}
            >
              Submit
            </button>
          </>
        }
      >
        {selectedReview && (
          <div>
            <div className="review-preview">
              <p>
                <strong>Product:</strong> {selectedReview.product?.name}
              </p>
              <p>
                <strong>User:</strong> {selectedReview.user?.name}
              </p>
              <p>
                <strong>Rating:</strong> {selectedReview.rating}/5
              </p>
              <p>
                <strong>Review:</strong> {selectedReview.comment}
              </p>
            </div>
            <div className="form-group">
              <label>Your Response</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Write your response..."
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Product Modal */}
      <Modal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        title={editingProduct ? "Edit Product" : "Add New Product"}
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setShowProductModal(false)}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleProductSubmit}>
              {editingProduct ? "Update" : "Create"}
            </button>
          </>
        }
      >
        <form onSubmit={handleProductSubmit}>
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              className="form-control"
              value={productForm.name}
              onChange={(e) =>
                setProductForm({ ...productForm, name: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-control"
              value={productForm.description}
              onChange={(e) =>
                setProductForm({ ...productForm, description: e.target.value })
              }
              rows="3"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Price (₹)</label>
              <input
                type="number"
                className="form-control"
                value={productForm.price}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    price: parseFloat(e.target.value),
                  })
                }
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input
                type="number"
                className="form-control"
                value={productForm.stock}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    stock: parseInt(e.target.value),
                  })
                }
                min="0"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Category</label>
            <select
              className="form-control"
              value={productForm.category}
              onChange={(e) =>
                setProductForm({ ...productForm, category: e.target.value })
              }
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Image URL</label>
            <input
              type="text"
              className="form-control"
              value={productForm.image}
              onChange={(e) =>
                setProductForm({ ...productForm, image: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={productForm.isAvailable}
                onChange={(e) =>
                  setProductForm({
                    ...productForm,
                    isAvailable: e.target.checked,
                  })
                }
              />
              Available
            </label>
            <label>
              <input
                type="checkbox"
                checked={productForm.featured}
                onChange={(e) =>
                  setProductForm({ ...productForm, featured: e.target.checked })
                }
              />
              Featured
            </label>
          </div>
        </form>
      </Modal>

      {/* Category Modal */}
      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title={editingCategory ? "Edit Category" : "Add New Category"}
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setShowCategoryModal(false)}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCategorySubmit}>
              {editingCategory ? "Update" : "Create"}
            </button>
          </>
        }
      >
        <form onSubmit={handleCategorySubmit}>
          <div className="form-group">
            <label>Category Name</label>
            <input
              type="text"
              className="form-control"
              value={categoryForm.name}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, name: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-control"
              value={categoryForm.description}
              onChange={(e) =>
                setCategoryForm({
                  ...categoryForm,
                  description: e.target.value,
                })
              }
              rows="3"
            />
          </div>
          <div className="form-group">
            <label>Image URL</label>
            <input
              type="text"
              className="form-control"
              value={categoryForm.image}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, image: e.target.value })
              }
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={categoryForm.isActive}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    isActive: e.target.checked,
                  })
                }
              />
              Active
            </label>
          </div>
        </form>
      </Modal>

      {/* Coupon Modal */}
      <Modal
        isOpen={showCouponModal}
        onClose={() => setShowCouponModal(false)}
        title={editingCoupon ? "Edit Coupon" : "Create Coupon"}
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setShowCouponModal(false)}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCouponSubmit}>
              {editingCoupon ? "Update" : "Create"}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label>Coupon Code *</label>
          <input
            type="text"
            className="form-control"
            value={couponForm.code}
            onChange={(e) =>
              setCouponForm({
                ...couponForm,
                code: e.target.value.toUpperCase(),
              })
            }
            placeholder="e.g., SAVE20"
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            className="form-control"
            value={couponForm.description}
            onChange={(e) =>
              setCouponForm({ ...couponForm, description: e.target.value })
            }
            placeholder="e.g., Get 20% off"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Discount Type *</label>
            <select
              className="form-control"
              value={couponForm.discountType}
              onChange={(e) =>
                setCouponForm({ ...couponForm, discountType: e.target.value })
              }
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Discount Value *</label>
            <input
              type="number"
              className="form-control"
              value={couponForm.discountValue}
              onChange={(e) =>
                setCouponForm({
                  ...couponForm,
                  discountValue: parseFloat(e.target.value),
                })
              }
              min="0"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Min Order (₹)</label>
            <input
              type="number"
              className="form-control"
              value={couponForm.minOrderAmount}
              onChange={(e) =>
                setCouponForm({
                  ...couponForm,
                  minOrderAmount: parseFloat(e.target.value) || 0,
                })
              }
              min="0"
            />
          </div>
          <div className="form-group">
            <label>Max Discount (₹)</label>
            <input
              type="number"
              className="form-control"
              value={couponForm.maxDiscount}
              onChange={(e) =>
                setCouponForm({
                  ...couponForm,
                  maxDiscount: parseFloat(e.target.value) || "",
                })
              }
              min="0"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Valid From</label>
            <input
              type="date"
              className="form-control"
              value={couponForm.validFrom}
              onChange={(e) =>
                setCouponForm({ ...couponForm, validFrom: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Valid Until *</label>
            <input
              type="date"
              className="form-control"
              value={couponForm.validUntil}
              onChange={(e) =>
                setCouponForm({ ...couponForm, validUntil: e.target.value })
              }
              min={couponForm.validFrom}
              required
            />
          </div>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              checked={couponForm.isActive}
              onChange={(e) =>
                setCouponForm({ ...couponForm, isActive: e.target.checked })
              }
            />
            Active
          </label>
        </div>
      </Modal>

      {/* Order Details Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title={`Order #${selectedOrder?._id.slice(-8).toUpperCase()}`}
      >
        {selectedOrder && (
          <div className="order-details">
            <div className="order-section">
              <h4>Customer Details</h4>
              <p>
                <strong>Name:</strong> {selectedOrder.user?.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedOrder.user?.email}
              </p>
              <p>
                <strong>Phone:</strong> {selectedOrder.shippingAddress?.phone}
              </p>
            </div>

            <div className="order-section">
              <h4>Delivery Address</h4>
              <p>
                {selectedOrder.shippingAddress?.street}
                <br />
                {selectedOrder.shippingAddress?.city},{" "}
                {selectedOrder.shippingAddress?.state}{" "}
                {selectedOrder.shippingAddress?.zipCode}
              </p>
            </div>

            <div className="order-section">
              <h4>Order Items</h4>
              {selectedOrder.items.map((item, index) => (
                <div key={index} className="order-item">
                  <span>{item.name}</span>
                  <span>
                    {item.quantity} × ₹{item.price.toFixed(2)}
                  </span>
                  <span>₹{(item.quantity * item.price).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax (GST)</span>
                <span>₹{selectedOrder.tax.toFixed(2)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="summary-row discount">
                  <span>Discount</span>
                  <span>-₹{selectedOrder.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Admin;
