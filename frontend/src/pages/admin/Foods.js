import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './Admin.css';

const Foods = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    restaurant: '',
    image: '',
    preparationTime: 20,
    isAvailable: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [foodsRes, categoriesRes, restaurantsRes] = await Promise.all([
        api.get('/foods?limit=100'),
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFood) {
        await api.put(`/foods/${editingFood._id}`, formData);
        toast.success('Food updated successfully!');
      } else {
        await api.post('/foods', formData);
        toast.success('Food created successfully!');
      }
      setShowForm(false);
      setEditingFood(null);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save food');
    }
  };

  const handleEdit = (food) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      description: food.description,
      price: food.price,
      category: food.category._id || food.category,
      restaurant: food.restaurant._id || food.restaurant,
      image: food.image,
      preparationTime: food.preparationTime,
      isAvailable: food.isAvailable,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this food?')) {
      try {
        await api.delete(`/foods/${id}`);
        toast.success('Food deleted successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete food');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      restaurant: '',
      image: '',
      preparationTime: 20,
      isAvailable: true,
    });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Manage Foods</h1>
          <button
            className="btn-add"
            onClick={() => {
              setShowForm(!showForm);
              setEditingFood(null);
              resetForm();
            }}
          >
            {showForm ? 'Cancel' : 'Add Food'}
          </button>
        </div>

        {showForm && (
          <div className="admin-form">
            <h2>{editingFood ? 'Edit Food' : 'Add New Food'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Restaurant</label>
                <select
                  name="restaurant"
                  value={formData.restaurant}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Restaurant</option>
                  {restaurants.map((rest) => (
                    <option key={rest._id} value={rest._id}>
                      {rest.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Preparation Time (minutes)</label>
                <input
                  type="number"
                  name="preparationTime"
                  value={formData.preparationTime}
                  onChange={handleChange}
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleChange}
                  />
                  Available
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingFood ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowForm(false);
                    setEditingFood(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Restaurant</th>
                <th>Available</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {foods.map((food) => (
                <tr key={food._id}>
                  <td>{food.name}</td>
                  <td>${food.price}</td>
                  <td>{food.category?.name || 'N/A'}</td>
                  <td>{food.restaurant?.name || 'N/A'}</td>
                  <td>{food.isAvailable ? 'Yes' : 'No'}</td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className="admin-button btn-edit"
                        onClick={() => handleEdit(food)}
                      >
                        Edit
                      </button>
                      <button
                        className="admin-button btn-delete"
                        onClick={() => handleDelete(food._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Foods;

