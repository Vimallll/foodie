import React from 'react';
import { Link } from 'react-router-dom';
import './Blog.css';

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: '10 Must-Try Street Food Dishes in Mumbai',
      excerpt: 'Discover the hidden gems of Mumbai\'s vibrant street food scene.',
      image: '🍜',
      category: 'Food',
      date: 'March 15, 2024',
      readTime: '5 min read',
    },
    {
      id: 2,
      title: 'Healthy Eating Tips for Busy Professionals',
      excerpt: 'How to maintain a healthy diet even with a hectic schedule.',
      image: '🥗',
      category: 'Health',
      date: 'March 10, 2024',
      readTime: '7 min read',
    },
    {
      id: 3,
      title: 'Top 5 Restaurants for Date Night in Delhi',
      excerpt: 'Romantic dining spots that will impress your special someone.',
      image: '🍷',
      category: 'Dining',
      date: 'March 5, 2024',
      readTime: '6 min read',
    },
    {
      id: 4,
      title: 'The Future of Food Delivery Technology',
      excerpt: 'Exploring how AI and automation are changing food delivery.',
      image: '🤖',
      category: 'Technology',
      date: 'February 28, 2024',
      readTime: '8 min read',
    },
    {
      id: 5,
      title: 'Sustainable Food Practices: A Guide',
      excerpt: 'How to make eco-friendly choices when ordering food.',
      image: '🌱',
      category: 'Sustainability',
      date: 'February 20, 2024',
      readTime: '6 min read',
    },
    {
      id: 6,
      title: 'Spicy Food Challenge: How Hot Can You Go?',
      excerpt: 'A guide to India\'s spiciest dishes and how to handle the heat.',
      image: '🌶️',
      category: 'Food',
      date: 'February 15, 2024',
      readTime: '5 min read',
    },
  ];

  const categories = ['All', 'Food', 'Health', 'Dining', 'Technology', 'Sustainability'];

  return (
    <div className="blog-page">
      <div className="blog-hero">
        <div className="container">
          <h1>Foodie Blog</h1>
          <p className="hero-subtitle">Stories, tips, and insights about food and delivery</p>
        </div>
      </div>

      <div className="container">
        <div className="blog-filters">
          {categories.map((category) => (
            <button key={category} className="filter-button">
              {category}
            </button>
          ))}
        </div>

        <div className="blog-grid">
          {blogPosts.map((post) => (
            <article key={post.id} className="blog-card">
              <div className="blog-image">{post.image}</div>
              <div className="blog-content">
                <div className="blog-meta">
                  <span className="blog-category">{post.category}</span>
                  <span className="blog-date">{post.date}</span>
                </div>
                <h2 className="blog-title">{post.title}</h2>
                <p className="blog-excerpt">{post.excerpt}</p>
                <div className="blog-footer">
                  <span className="blog-read-time">{post.readTime}</span>
                  <Link to={`/blog/${post.id}`} className="blog-read-more">
                    Read More →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="blog-newsletter">
          <h2>Subscribe to Our Newsletter</h2>
          <p>Get the latest food trends, restaurant reviews, and exclusive offers delivered to your inbox.</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Enter your email address" />
            <button className="btn-primary">Subscribe</button>
          </div>
        </div>

        <div className="back-home">
          <Link to="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Blog;

