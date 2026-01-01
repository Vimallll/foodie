import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [availableLocations, setAvailableLocations] = useState([]);
  const [searchType, setSearchType] = useState('food'); // 'food' or 'restaurant'
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const categoryScrollRef = useRef(null);
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category');
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Extract unique cities from restaurants
    if (restaurants.length > 0) {
      const cities = [...new Set(restaurants
        .map(r => r.address?.city)
        .filter(city => city && city.trim())
      )].sort();
      setAvailableLocations(cities);
      if (cities.length > 0 && !selectedLocation) {
        setSelectedLocation(cities[0]);
      }
    }
  }, [restaurants]);

  useEffect(() => {
    const checkScrollButtons = () => {
      if (categoryScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    if (categoryScrollRef.current) {
      checkScrollButtons();
      categoryScrollRef.current.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
    }

    return () => {
      if (categoryScrollRef.current) {
        categoryScrollRef.current.removeEventListener('scroll', checkScrollButtons);
      }
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, [categories]);

  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = 300;
      const currentScroll = categoryScrollRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      categoryScrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (searchType === 'food') {
        navigate(`/foods?search=${encodeURIComponent(searchQuery)}`);
      } else {
        navigate(`/foods?restaurant=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  const getCategoryEmoji = (categoryName) => {
    const emojiMap = {
      'pizza': '🍕',
      'burger': '🍔',
      'pasta': '🍝',
      'sushi': '🍣',
      'chinese': '🥟',
      'indian': '🍛',
      'mexican': '🌮',
      'dessert': '🍰',
      'drinks': '🥤',
      'salad': '🥗',
      'seafood': '🦞',
      'vegetarian': '🥬',
      'fast food': '🍟',
      'breakfast': '🥞',
      'lunch': '🍱',
      'dinner': '🍽️',
    };
    
    const lowerName = categoryName.toLowerCase();
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (lowerName.includes(key)) {
        return emoji;
      }
    }
    return '🍕'; // Default emoji
  };

  const determineVegStatus = (food) => {
    // Check category name for vegetarian indicators
    const categoryName = food.category?.name?.toLowerCase() || '';
    const foodName = food.name?.toLowerCase() || '';
    const description = food.description?.toLowerCase() || '';
    
    const vegKeywords = ['veg', 'vegetarian', 'salad', 'fruit', 'vegetable'];
    const nonVegKeywords = ['chicken', 'meat', 'fish', 'pork', 'beef', 'mutton', 'seafood', 'egg'];
    
    const allText = `${categoryName} ${foodName} ${description}`;
    
    if (nonVegKeywords.some(keyword => allText.includes(keyword))) {
      return false;
    }
    if (vegKeywords.some(keyword => allText.includes(keyword))) {
      return true;
    }
    
    // Default to non-veg for safety
    return false;
  };

  const toggleFavorite = (foodId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(foodId)) {
        newFavorites.delete(foodId);
        toast.info('Removed from favorites');
      } else {
        newFavorites.add(foodId);
        toast.success('Added to favorites');
      }
      return newFavorites;
    });
  };

  const handleAddToCart = async (food) => {
    if (!isAuthenticated) {
      toast.info('Please login to add items to cart');
      navigate('/login');
      return;
    }

    const result = await addToCart(food._id, 1);
    if (result.success) {
      toast.success(`${food.name} added to cart!`);
    } else {
      toast.error(result.message || 'Failed to add to cart');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-background"></div>
        <div className="hero-overlay"></div>
        
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="hero-title-line">Hungry? We've got</span>
              <span className="hero-title-line hero-title-accent">you covered!</span>
            </h1>
            <p className="hero-subtitle">
              Order from your favorite restaurants and get food delivered fresh to your doorstep
            </p>
          </div>

          <div className="hero-search-container">
            <div className="search-tabs">
              <button
                className={`search-tab ${searchType === 'food' ? 'active' : ''}`}
                onClick={() => setSearchType('food')}
              >
                <span className="tab-icon">🍔</span>
                Search Food
              </button>
              <button
                className={`search-tab ${searchType === 'restaurant' ? 'active' : ''}`}
                onClick={() => setSearchType('restaurant')}
              >
                <span className="tab-icon">🏪</span>
                Search Restaurant
              </button>
            </div>

            <form className="hero-search-form" onSubmit={handleSearch}>
              <div className="location-selector">
                <span className="location-icon">📍</span>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="location-select"
                >
                  {availableLocations.map((city, index) => (
                    <option key={index} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder={searchType === 'food' ? 'Search for food, dishes...' : 'Search for restaurants...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="hero-search-input"
                />
              </div>

              <button type="submit" className="search-button">
                Search
              </button>
            </form>
          </div>

          <div className="hero-cta-buttons">
            <Link to="/foods" className="cta-button cta-primary">
              <span>Browse All Foods</span>
              <span className="cta-arrow">→</span>
            </Link>
            <Link to="/foods" className="cta-button cta-secondary">
              <span>View Restaurants</span>
            </Link>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">100+</div>
              <div className="stat-label">Restaurants</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Food Items</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">30min</div>
              <div className="stat-label">Avg Delivery</div>
            </div>
          </div>
        </div>

        <div className="hero-decoration">
          <div className="floating-food floating-food-1">🍕</div>
          <div className="floating-food floating-food-2">🍔</div>
          <div className="floating-food floating-food-3">🍜</div>
          <div className="floating-food floating-food-4">🍰</div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="section category-section">
          <div className="container">
            <div className="section-header">
              <h2>What's on your mind?</h2>
              <p className="section-subtitle">Browse by category</p>
            </div>
            
            <div className="category-wrapper">
              {showLeftArrow && (
                <button
                  className="category-scroll-btn category-scroll-left"
                  onClick={() => scrollCategories('left')}
                  aria-label="Scroll left"
                >
                  <span className="scroll-arrow">‹</span>
                </button>
              )}
              
              <div 
                className="category-grid" 
                ref={categoryScrollRef}
              >
                {categories.map((category) => {
                  const isActive = activeCategory === category._id;
                  return (
                    <Link
                      key={category._id}
                      to={`/foods?category=${category._id}`}
                      className={`category-card ${isActive ? 'active' : ''}`}
                    >
                      <div className="category-image-wrapper">
                        {category.image ? (
                          <img src={category.image} alt={category.name} />
                        ) : (
                          <div className="category-placeholder">
                            {getCategoryEmoji(category.name)}
                          </div>
                        )}
                        {isActive && (
                          <div className="active-indicator">
                            <span className="active-check">✓</span>
                          </div>
                        )}
                      </div>
                      <h3>{category.name}</h3>
                    </Link>
                  );
                })}
              </div>

              {showRightArrow && (
                <button
                  className="category-scroll-btn category-scroll-right"
                  onClick={() => scrollCategories('right')}
                  aria-label="Scroll right"
                >
                  <span className="scroll-arrow">›</span>
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {restaurants.length > 0 && (
        <section className="section">
          <div className="container">
            <h2>Top Restaurants</h2>
            <div className="restaurant-grid">
              {restaurants.slice(0, 6).map((restaurant) => (
                <Link
                  key={restaurant._id}
                  to={`/foods?restaurant=${restaurant._id}`}
                  className="restaurant-card"
                >
                  <div className="restaurant-image">
                    {restaurant.image ? (
                      <img src={restaurant.image} alt={restaurant.name} />
                    ) : (
                      <div className="restaurant-placeholder">🏪</div>
                    )}
                  </div>
                  <div className="restaurant-info">
                    <h3>{restaurant.name}</h3>
                    <p className="restaurant-cuisine">{restaurant.cuisine || 'Multi-cuisine'}</p>
                    <div className="restaurant-meta">
                      <span className="restaurant-rating">⭐ 4.2</span>
                      <span className="restaurant-delivery">• 25-30 min</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <h2>Popular Foods</h2>
          <div className="food-grid">
            {foods.map((food) => {
              const isFavorite = favorites.has(food._id);
              const isVeg = determineVegStatus(food);
              const rating = food.rating || 4.2;
              const deliveryTime = food.preparationTime || 30;

              return (
                <div key={food._id} className="food-card">
                  <Link to={`/foods/${food._id}`} className="food-card-link">
                    <div className="food-image">
                      {food.image ? (
                        <img src={food.image} alt={food.name} />
                      ) : (
                        <div className="food-placeholder">🍽️</div>
                      )}
                      
                      {/* Veg/Non-veg Indicator */}
                      <div className={`veg-indicator ${isVeg ? 'veg' : 'non-veg'}`}>
                        <div className="veg-dot"></div>
                      </div>

                      {/* Favorite Button */}
                      <button
                        className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFavorite(food._id);
                        }}
                        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <span className="heart-icon">{isFavorite ? '❤️' : '🤍'}</span>
                      </button>
                    </div>

                    <div className="food-info">
                      <div className="food-header">
                        <h3>{food.name}</h3>
                        <div className="food-rating">
                          <span className="star-icon">⭐</span>
                          <span className="rating-value">{rating.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <p className="food-description">{food.description}</p>
                      
                      <div className="food-meta">
                        <div className="delivery-time">
                          <span className="time-icon">⏱️</span>
                          <span>{deliveryTime} min</span>
                        </div>
                        <div className="restaurant-name">
                          <span className="restaurant-icon">📍</span>
                          <span>{food.restaurant?.name}</span>
                        </div>
                      </div>

                      <div className="food-footer">
                        <div className="price-section">
                          <span className="price-label">Price</span>
                          <span className="food-price">₹{food.price}</span>
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Add to Cart Button */}
                  <button
                    className="add-to-cart-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCart(food);
                    }}
                  >
                    <span className="cart-icon">🛒</span>
                    <span>Add to Cart</span>
                  </button>
                </div>
              );
            })}
          </div>
          <div className="section-footer">
            <Link to="/foods" className="view-all-button">
              View All Foods
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

