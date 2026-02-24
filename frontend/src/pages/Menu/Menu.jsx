import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSearch, FiFilter } from "react-icons/fi";
import { GiCoffeeCup } from "react-icons/gi";
import ProductCard from "../../components/ProductCard/ProductCard";
import Loader from "../../components/Loader/Loader";
import { productsAPI, categoriesAPI } from "../../services/api";
import "./Menu.css";

const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all",
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchTerm]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      const response = await productsAPI.getAll(params);
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    if (categoryId === "all") {
      searchParams.delete("category");
    } else {
      searchParams.set("category", categoryId);
    }
    setSearchParams(searchParams);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="menu-page page">
      <div className="page-header">
        <div className="container">
          <h1>Our Menu</h1>
          <p>Discover our delicious range of coffees, snacks, and desserts</p>
        </div>
      </div>

      <div className="page-content">
        <div className="container">
          <div className="menu-filters">
            <div className="filters-wrapper">
              <div className="search-box">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search for items..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>

              <div className="category-filters">
                <button
                  className={`category-btn ${selectedCategory === "all" ? "active" : ""}`}
                  onClick={() => handleCategoryChange("all")}
                >
                  All Items
                </button>
                {categories.map((category) => (
                  <button
                    key={category._id}
                    className={`category-btn ${selectedCategory === category._id ? "active" : ""}`}
                    onClick={() => handleCategoryChange(category._id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <Loader text="Loading menu items..." />
          ) : products.length > 0 ? (
            <div className="menu-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="no-products">
              <GiCoffeeCup className="icon" />
              <h3>No items found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;
