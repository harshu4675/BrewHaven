import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
  FiLogOut,
  FiSettings,
  FiGrid,
  FiHome,
  FiCoffee,
  FiPhone,
  FiInfo,
  FiShoppingBag,
  FiStar,
  FiEdit2,
} from "react-icons/fi";
import { GiCoffeeCup } from "react-icons/gi";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import Notifications from "../Notifications/Notifications";
import "./Navbar.css";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    navigate("/");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <GiCoffeeCup className="logo-icon" />
            <h1>
              Brew<span>Haven</span>
            </h1>
          </Link>

          {/* Desktop Menu */}
          <div className="navbar-menu">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/menu">Menu</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </div>

          <div className="navbar-actions">
            {/* Notifications - Only for logged in users */}
            {isAuthenticated && <Notifications />}

            {/* Cart */}
            <Link to="/cart" className="navbar-cart">
              <FiShoppingCart />
              {getItemCount() > 0 && (
                <span className="cart-badge">{getItemCount()}</span>
              )}
            </Link>

            {isAuthenticated ? (
              /* Profile Button for Logged In Users */
              <button
                className="navbar-profile-btn"
                onClick={toggleSidebar}
                aria-label="Open profile menu"
                title={user?.name || "Profile"}
              >
                <div className="navbar-profile-avatar">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name} />
                  ) : (
                    <FiUser />
                  )}
                </div>
                <span className="navbar-profile-name desktop-only">
                  {user?.name?.split(" ")[0] || "Menu"}
                </span>
              </button>
            ) : (
              /* Login Button for Non-Logged In Users */
              <Link to="/login" className="btn btn-primary btn-sm">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar - Only for Logged In Users */}
      {isAuthenticated && (
        <>
          {/* Overlay */}
          <div
            className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
            onClick={closeSidebar}
          />

          {/* Sidebar */}
          <aside className={`sidebar ${sidebarOpen ? "active" : ""}`}>
            {/* Sidebar Header */}
            <div className="sidebar-header">
              <div className="sidebar-logo">
                <GiCoffeeCup className="logo-icon" />
                <h2>Menu</h2>
              </div>
              <button
                className="sidebar-close"
                onClick={closeSidebar}
                aria-label="Close menu"
              >
                <FiX />
              </button>
            </div>

            {/* User Info */}
            <div className="sidebar-user">
              <div className="sidebar-user-avatar">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} />
                ) : (
                  <FiUser />
                )}
              </div>
              <div className="sidebar-user-info">
                <h4>{user?.name || "User"}</h4>
                <p>{user?.email || ""}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
              {/* Main Navigation */}
              <div className="sidebar-nav-section">
                <p className="sidebar-nav-title">Navigation</p>
                <NavLink
                  to="/"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <FiHome />
                  Home
                </NavLink>
                <NavLink
                  to="/menu"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <FiCoffee />
                  Menu
                </NavLink>
                <NavLink
                  to="/about"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <FiInfo />
                  About Us
                </NavLink>
                <NavLink
                  to="/contact"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <FiPhone />
                  Contact
                </NavLink>
              </div>

              <div className="sidebar-nav-divider" />

              {/* Account Section */}
              <div className="sidebar-nav-section">
                <p className="sidebar-nav-title">My Account</p>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  <FiShoppingBag />
                  My Orders
                </NavLink>
                <button
                  onClick={() => {
                    navigate("/dashboard");
                    closeSidebar();
                    setTimeout(() => {
                      window.dispatchEvent(
                        new CustomEvent("switchDashboardTab", {
                          detail: "reviews",
                        }),
                      );
                    }, 100);
                  }}
                >
                  <FiStar />
                  Write Reviews
                </button>
                <button
                  onClick={() => {
                    navigate("/dashboard");
                    closeSidebar();
                    setTimeout(() => {
                      window.dispatchEvent(
                        new CustomEvent("switchDashboardTab", {
                          detail: "my-reviews",
                        }),
                      );
                    }, 100);
                  }}
                >
                  <FiEdit2 />
                  My Reviews
                </button>
                <button
                  onClick={() => {
                    navigate("/dashboard");
                    closeSidebar();
                    setTimeout(() => {
                      window.dispatchEvent(
                        new CustomEvent("switchDashboardTab", {
                          detail: "profile",
                        }),
                      );
                    }, 100);
                  }}
                >
                  <FiSettings />
                  Profile Settings
                </button>
              </div>

              {/* Admin Section - Only show for admin users */}
              {isAdmin && (
                <>
                  <div className="sidebar-nav-divider" />
                  <div className="sidebar-nav-section">
                    <p className="sidebar-nav-title">Admin</p>
                    <NavLink
                      to="/admin"
                      className={({ isActive }) => (isActive ? "active" : "")}
                    >
                      <FiGrid />
                      Admin Panel
                    </NavLink>
                  </div>
                </>
              )}
            </nav>

            {/* Sidebar Footer */}
            <div className="sidebar-footer">
              <button className="btn-logout" onClick={handleLogout}>
                <FiLogOut />
                Logout
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default Navbar;
