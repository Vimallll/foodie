import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import './Foods.css';

const Foods = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    restaurant: searchParams.get('restaurant') || '',
  });

  useEffect(() => {
    fetchCategories();
    fetchRestaurants();
  }, []);

  useEffect(() => {
    fetchFoods();
  }, [filters]);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.restaurant) params.append('restaurant', filters.restaurant);

      const response = await api.get(`/foods?${params.toString()}`);
      setFoods(response.data.foods);
    } catch (error) {
      console.error('Error fetching foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await api.get('/restaurants');
      setRestaurants(response.data.restaurants);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    setSearchParams(newFilters);
  };

  return (
    <div className="foods-page">
      <div className="container">
        <h1>All Foods</h1>

        <div className="filters">
          <div className="filter-group search-group">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search foods..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-group">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <select
              value={filters.restaurant}
              onChange={(e) => handleFilterChange('restaurant', e.target.value)}
              className="filter-select"
            >
              <option value="">All Restaurants</option>
              {restaurants.map((rest) => (
                <option key={rest._id} value={rest._id}>
                  {rest.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : foods.length === 0 ? (
          <div className="no-results">No foods found</div>
        ) : (
          <div className="foods-grid">
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
                    <span className="food-price">₹{food.price}</span>
                    <span className="food-restaurant">{food.restaurant?.name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Foods;

