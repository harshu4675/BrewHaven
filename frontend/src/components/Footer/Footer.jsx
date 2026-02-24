import React from "react";
import { Link } from "react-router-dom";
import {
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiYoutube,
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
} from "react-icons/fi";
import { GiCoffeeCup } from "react-icons/gi";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <h2>
              <GiCoffeeCup /> BrewHaven
            </h2>
            <p>
              Experience the perfect blend of artisan coffee, delicious treats,
              and warm hospitality at Brew Haven. Where every cup tells a story.
            </p>
            <div className="footer-social">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiFacebook />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiInstagram />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiTwitter />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FiYoutube />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/menu">Our Menu</Link>
              </li>
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Categories</h3>
            <ul>
              <li>
                <Link to="/menu?category=coffee">Coffee</Link>
              </li>
              <li>
                <Link to="/menu?category=snacks">Snacks</Link>
              </li>
              <li>
                <Link to="/menu?category=desserts">Desserts</Link>
              </li>
              <li>
                <Link to="/menu?category=combos">Combos</Link>
              </li>
            </ul>
          </div>

          <div className="footer-section footer-newsletter">
            <h3>Contact Info</h3>
            <ul>
              <li>
                <FiMapPin />
                123 Coffee Street, Downtown, NY 10001
              </li>
              <li>
                <FiPhone />
                +1 (555) 123-4567
              </li>
              <li>
                <FiMail />
                hello@brewhaven.com
              </li>
              <li>
                <FiClock />
                Mon-Sun: 8:00 AM - 10:00 PM
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} Brew Haven. All rights reserved.
          </p>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
