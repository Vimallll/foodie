import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Home.css';

const Home = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [foodsRes, categoriesRes, restaurantsRes] = await Promise.all([
        api.get('/foods?limit=8'),
        api.get('/categories'),
        api.get('/restaurants'),
      ]);

      setFoods(foodsRes.data.foods);
      setCategories(categoriesRes.data.categories);
      setRestaurants(restaurantsRes.data.restaurants);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Delicious Food Delivered to Your Door</h1>
          <p>Order from your favorite restaurants and enjoy fresh meals</p>
          <Link to="/foods" className="cta-button">
            Order Now
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Popular Foods</h2>
          <div className="food-grid">
            {foods.map((food) => (
              <Link key={food._id} to={`/foods/${food._id}`} className="food-card">
                <div className="food-image">
                  {food.image ? (
                    <img src={food.image} alt={food.name} />
                  ) : (
                    <div className="food-placeholder">🍽️</div>
                  )}
                </div>
                <div className="food-info">
                  <h3>{food.name}</h3>
                  <p className="food-description">{food.description}</p>
                  <div className="food-footer">
                    <span className="food-price">${food.price}</span>
                    <span className="food-restaurant">{food.restaurant?.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="section-footer">
            <Link to="/foods" className="view-all-button">
              View All Foods
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Categories</h2>
          <div className="category-grid">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/foods?category=${category._id}`}
                className="category-card"
              >
                {category.image ? (
                  <img src={category.image} alt={category.name} />
                ) : (
                  <div className="category-placeholder">📦</div>
                )}
                <h3>{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

