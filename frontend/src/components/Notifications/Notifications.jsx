import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  FiBell,
  FiX,
  FiCheck,
  FiCheckCircle,
  FiPackage,
  FiClock,
  FiAlertCircle,
  FiTrash2,
  FiVolume2,
  FiVolumeX,
} from "react-icons/fi";
import { notificationsAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import notificationSound from "../../utils/notificationSound";
import "./Notifications.css";

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(notificationSound.isEnabled);
  const { isAuthenticated } = useAuth();
  const dropdownRef = useRef(null);
  const prevUnreadCount = useRef(0);
  const isFirstLoad = useRef(true);

  const playNotificationSound = useCallback(() => {
    try {
      // Use playWithVibration for mobile support
      notificationSound.playWithVibration();
    } catch (error) {
      console.warn("Could not play notification sound:", error);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await notificationsAPI.getUnreadCount();
      const newCount = response.data.count;

      // Play sound only if:
      // 1. Not the first load
      // 2. New notifications arrived (count increased)
      // 3. Previous count was not 0 (to avoid sound on page load)
      if (
        !isFirstLoad.current &&
        newCount > prevUnreadCount.current &&
        prevUnreadCount.current >= 0
      ) {
        console.log("New notification detected! Playing sound...");
        playNotificationSound();
      }

      // After first successful fetch, mark as not first load
      if (isFirstLoad.current) {
        isFirstLoad.current = false;
      }

      prevUnreadCount.current = newCount;
      setUnreadCount(newCount);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, [playNotificationSound]);

  useEffect(() => {
    if (isAuthenticated) {
      // Initial fetch
      fetchUnreadCount();

      // Poll for new notifications every 15 seconds
      const interval = setInterval(fetchUnreadCount, 15000);

      return () => {
        clearInterval(interval);
        isFirstLoad.current = true; // Reset on unmount
      };
    }
  }, [isAuthenticated, fetchUnreadCount]);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchNotifications();
    }
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getAll({ limit: 10 });
      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationsAPI.delete(id);
      const notification = notifications.find((n) => n._id === id);
      if (notification && !notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const toggleSound = () => {
    const newState = notificationSound.toggle();
    setSoundEnabled(newState);

    // Play test sound when enabling
    if (newState) {
      setTimeout(() => {
        notificationSound.testSound();
      }, 100);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order_placed":
      case "new_order":
        return <FiPackage className="icon order-placed" />;
      case "order_confirmed":
        return <FiCheckCircle className="icon confirmed" />;
      case "order_preparing":
        return <FiClock className="icon preparing" />;
      case "order_ready":
        return <FiCheck className="icon ready" />;
      case "order_delivered":
        return <FiCheckCircle className="icon delivered" />;
      case "order_cancelled":
        return <FiAlertCircle className="icon cancelled" />;
      default:
        return <FiBell className="icon" />;
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diff = now - notificationDate;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return notificationDate.toLocaleDateString();
  };

  if (!isAuthenticated) return null;

  return (
    <div className="notifications-container" ref={dropdownRef}>
      <button
        className="notifications-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <FiBell />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
            <div className="notifications-actions">
              <button
                onClick={toggleSound}
                className={`sound-toggle ${soundEnabled ? "enabled" : "disabled"}`}
                title={
                  soundEnabled ? "Mute notifications" : "Unmute notifications"
                }
              >
                {soundEnabled ? <FiVolume2 /> : <FiVolumeX />}
              </button>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="mark-all-read">
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="notifications-list">
            {loading ? (
              <div className="notifications-loading">
                <div className="spinner"></div>
                <p>Loading...</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.isRead ? "unread" : ""}`}
                  onClick={() =>
                    !notification.isRead && markAsRead(notification._id)
                  }
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                  <button
                    className="notification-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification._id);
                    }}
                    aria-label="Delete notification"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))
            ) : (
              <div className="notifications-empty">
                <FiBell />
                <p>No notifications yet</p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notifications-footer">
              <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                View All Orders
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
