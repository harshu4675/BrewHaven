import React from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiHeart,
  FiAward,
  FiCoffee,
  FiUsers,
} from "react-icons/fi";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { GiCoffeeBeans, GiEarthAmerica } from "react-icons/gi";
import "./About.css";

const About = () => {
  const team = [
    {
      name: "John Smith",
      role: "Founder & Head Barista",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    },
    {
      name: "Sarah Johnson",
      role: "Head Chef",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    },
    {
      name: "Mike Williams",
      role: "Senior Barista",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    },
    {
      name: "Emily Davis",
      role: "Pastry Chef",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    },
  ];

  return (
    <div className="about-page page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-bg">
          <img
            src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1920"
            alt="Café"
          />
        </div>
        <div className="about-hero-content">
          <h1>Our Story</h1>
          <p>Crafting exceptional coffee experiences since 2009</p>
        </div>
      </section>

      {/* Story Section */}
      <section className="about-story">
        <div className="container">
          <div className="story-content">
            <div className="story-images">
              <img
                src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600"
                alt="Café interior"
                className="main-image"
              />
              <img
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300"
                alt="Coffee making"
                className="secondary-image"
              />
            </div>
            <div className="story-text">
              <h2>Welcome to Brew Haven</h2>
              <p>
                Our journey began in 2009 with a simple dream: to create a place
                where coffee lovers could experience the perfect cup. What
                started as a small corner café has grown into a beloved
                community gathering spot, but our passion remains unchanged.
              </p>
              <p>
                We source our beans directly from small-scale farmers across
                Ethiopia, Colombia, and Guatemala, ensuring fair trade practices
                and sustainable farming methods. Each batch is roasted in-house
                to bring out the unique flavors and aromas.
              </p>
              <blockquote>
                "Coffee is not just a drink, it's a moment of pleasure in a busy
                day."
              </blockquote>
              <p>
                Beyond coffee, we've expanded to offer a full menu of artisan
                pastries, fresh sandwiches, and healthy snacks—all made with
                locally sourced ingredients.
              </p>
              <Link to="/menu" className="btn btn-primary">
                Explore Our Menu <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <div className="section-title">
            <h2>Our Values</h2>
            <p>The principles that guide everything we do</p>
          </div>

          <div className="values-grid">
            <div className="value-card">
              <div className="icon">
                <GiCoffeeBeans />
              </div>
              <h3>Quality First</h3>
              <p>
                We never compromise on quality. From bean selection to brewing,
                every step is carefully crafted for perfection.
              </p>
            </div>
            <div className="value-card">
              <div className="icon">
                <GiEarthAmerica />
              </div>
              <h3>Sustainability</h3>
              <p>
                We're committed to sustainable practices, from eco-friendly
                packaging to supporting organic farming.
              </p>
            </div>
            <div className="value-card">
              <div className="icon">
                <FiHeart />
              </div>
              <h3>Community</h3>
              <p>
                More than a café, we're a gathering place for friends, families,
                and neighbors to connect.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Visit Us Today</h2>
          <p>
            Come experience the Brew Haven difference. We can't wait to serve
            you!
          </p>
          <div className="cta-buttons">
            <Link to="/contact" className="btn btn-primary btn-lg">
              Get Directions <FiArrowRight />
            </Link>
            <Link to="/menu" className="btn btn-secondary btn-lg">
              View Menu
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
