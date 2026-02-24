import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCoffee,
  FiAward,
  FiUsers,
  FiStar,
} from "react-icons/fi";
import { GiCoffeeBeans, GiCupcake, GiSandwich } from "react-icons/gi";
import ProductCard from "../../components/ProductCard/ProductCard";
import Loader from "../../components/Loader/Loader";
import { productsAPI, categoriesAPI } from "../../services/api";
import "./Home.css";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productsAPI.getAll({ featured: true }),
        categoriesAPI.getAll(),
      ]);
      setFeaturedProducts(productsRes.data.slice(0, 4));
      setCategories(categoriesRes.data.slice(0, 4));
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const categoryImages = {
    Coffee:
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400",
    Snacks:
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400",
    Desserts: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400",
    Combos:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <img
            src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1920"
            alt="Coffee background"
          />
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <FiStar />
            <span>Premium Quality Coffee</span>
          </div>
          <h1>
            Discover Your <span>Perfect</span> Cup of Coffee
          </h1>
          <p>
            Experience the art of coffee making with our handcrafted brews, made
            from the finest beans sourced from around the world.
          </p>
          <div className="hero-buttons">
            <Link to="/menu" className="btn btn-primary btn-lg">
              Explore Menu <FiArrowRight />
            </Link>
            <Link to="/about" className="btn btn-secondary btn-lg">
              Our Story
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">15+</span>
              <span className="stat-label">Years Experience</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">Coffee Varieties</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Happy Customers</span>
            </div>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600"
            alt="Coffee Cup"
          />
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="section-title">
            <h2>Our Categories</h2>
            <p>
              Explore our delicious range of handcrafted beverages and treats
            </p>
          </div>

          <div className="categories-grid">
            {categories.map((category) => (
              <Link
                to={`/menu?category=${category._id}`}
                key={category._id}
                className="category-card"
              >
                <img
                  src={
                    category.image ||
                    categoryImages[category.name] ||
                    categoryImages["Coffee"]
                  }
                  alt={category.name}
                />
                <div className="category-overlay">
                  <h3>{category.name}</h3>
                  <p>{category.description || "Explore our selection"}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="categories-section">
        <div className="container">
          <div className="section-title">
            <h2>Featured Items</h2>
            <p>
              Our most loved and popular items that customers can't get enough
              of
            </p>
          </div>

          {loading ? (
            <Loader text="Loading featured items..." />
          ) : (
            <div className="featured-grid">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <Link to="/menu" className="btn btn-primary">
              View All Menu <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section className="about-preview">
        <div className="container">
          <div className="about-preview-content">
            <div className="about-preview-image">
              <img
                src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600"
                alt="Café interior"
              />
              <div className="experience-badge">
                <span className="number">15+</span>
                <span className="text">Years of Excellence</span>
              </div>
            </div>
            <div className="about-preview-text">
              <h2>Welcome to Brew Haven</h2>
              <p>
                Since 2009, we've been crafting exceptional coffee experiences
                for our community. Our passion for quality and commitment to
                sustainability drives everything we do.
              </p>
              <p>
                From sourcing the finest beans to perfecting our brewing
                techniques, every cup we serve is a testament to our dedication
                to excellence.
              </p>

              <div className="about-features">
                <div className="about-feature">
                  <div className="icon">
                    <GiCoffeeBeans />
                  </div>
                  <div className="text">
                    <h4>Premium Beans</h4>
                    <p>Ethically sourced</p>
                  </div>
                </div>
                <div className="about-feature">
                  <div className="icon">
                    <FiAward />
                  </div>
                  <div className="text">
                    <h4>Award Winning</h4>
                    <p>Best café 2023</p>
                  </div>
                </div>
                <div className="about-feature">
                  <div className="icon">
                    <FiCoffee />
                  </div>
                  <div className="text">
                    <h4>Expert Baristas</h4>
                    <p>Trained professionals</p>
                  </div>
                </div>
                <div className="about-feature">
                  <div className="icon">
                    <FiUsers />
                  </div>
                  <div className="text">
                    <h4>Community</h4>
                    <p>Local partnerships</p>
                  </div>
                </div>
              </div>

              <Link to="/about" className="btn btn-primary">
                Learn More About Us <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Experience the Best Coffee?</h2>
          <p>
            Order online and enjoy our premium coffee and treats delivered fresh
            to your doorstep or pick them up at our café.
          </p>
          <div className="cta-buttons">
            <Link to="/menu" className="btn btn-primary btn-lg">
              Order Now <FiArrowRight />
            </Link>
            <Link to="/contact" className="btn btn-secondary btn-lg">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
