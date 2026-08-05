import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { AppProvider } from "./context/AppContext";

// Components
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Alert from "./components/Alert/Alert";
import ShopStatus from "./components/ShopStatus/ShopStatus";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import InstallPWA from "./components/InstallPWA/InstallPWA";
import OfflineFallback from "./components/OfflineFallback/OfflineFallback";
import Loader from "./components/Loader/Loader";

// Pages
import Home from "./pages/Home/Home";
import Menu from "./pages/Menu/Menu";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import Cart from "./pages/Cart/Cart";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Checkout from "./pages/Checkout/Checkout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Admin from "./pages/Admin/Admin";
import OrderSuccess from "./pages/OrderSuccess/OrderSuccess";
import ProductDetail from "./pages/ProductDetail/ProductDetail";

// Styles
import "./styles/index.css";
import "./styles/components.css";
import "./styles/pages.css";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log("🌐 Connection restored");
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log("📡 Connection lost");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("connection-online", handleOnline);
    window.addEventListener("connection-offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("connection-online", handleOnline);
      window.removeEventListener("connection-offline", handleOffline);
    };
  }, []);

  // ✅ FIXED: Loader is now INSIDE the providers
  return (
    <AuthProvider>
      <CartProvider>
        <AppProvider>
          {loading ? (
            <Loader />
          ) : (
            <div className={`app ${!isOnline ? "offline-mode" : ""}`}>
              {!isOnline && <OfflineFallback />}

              <ShopStatus />
              <Navbar />
              <Alert />

              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/order-success"
                    element={
                      <ProtectedRoute>
                        <OrderSuccess />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/admin/*"
                    element={
                      <ProtectedRoute adminOnly>
                        <Admin />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>

              {!isAdminRoute && <Footer />}
              <InstallPWA />
            </div>
          )}
        </AppProvider>
      </CartProvider>
    </AuthProvider>
  );
}

const NotFound = () => (
  <div className="not-found">
    <h1>404</h1>
    <h2>Page Not Found</h2>
    <p>The page you're looking for doesn't exist.</p>
    <a href="/">Go Home</a>
  </div>
);

export default App;
