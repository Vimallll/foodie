import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import './FoodDetails.css';

const FoodDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const [food, setFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchFood();
  }, [id]);

  const fetchFood = async () => {
    try {
      const response = await api.get(`/foods/${id}`);
      setFood(response.data.food);
    } catch (error) {
      console.error('Error fetching food:', error);
      toast.error('Food not found');
      navigate('/foods');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to add items to cart');
      navigate('/login');
      return;
    }

    const result = await addToCart(food._id, quantity);
    if (result.success) {
      toast.success('Added to cart!');
    } else {
      toast.error(result.message || 'Failed to add to cart');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!food) {
    return null;
  }

  return (
    <div className="food-details-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>

        <div className="food-details">
          <div className="food-image-large">
            {food.image ? (
              <img src={food.image} alt={food.name} />
            ) : (
              <div className="food-placeholder-large">🍽️</div>
            )}
          </div>

          <div className="food-content">
            <h1>{food.name}</h1>
            <p className="food-description-full">{food.description}</p>

            <div className="food-meta">
              <div className="meta-item">
                <strong>Price:</strong> <span className="price">₹{food.price}</span>
              </div>
              <div className="meta-item">
                <strong>Category:</strong> {food.category?.name}
              </div>
              <div className="meta-item">
                <strong>Restaurant:</strong> {food.restaurant?.name}
              </div>
              <div className="meta-item">
                <strong>Preparation Time:</strong> {food.preparationTime} minutes
              </div>
            </div>

            <div className="add-to-cart-section">
              <div className="quantity-selector">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="quantity-btn"
                >
                  -
                </button>
                <span className="quantity">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="quantity-btn"
                >
                  +
                </button>
              </div>

              <button onClick={handleAddToCart} className="add-to-cart-button">
                Add to Cart - ₹{(food.price * quantity).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetails;

