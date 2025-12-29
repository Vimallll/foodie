import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../admin/Admin.css';

const RestaurantAdminFoods = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    preparationTime: 20,
    isAvailable: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [foodsRes, categoriesRes] = await Promise.all([
        api.get('/restaurant-admin/foods'),
        api.get('/categories'),
      ]);
      setFoods(foodsRes.data.foods);
      setCategories(categoriesRes.data.categories);
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
        await api.put(`/restaurant-admin/foods/${editingFood._id}`, formData);
        toast.success('Food updated successfully');
      } else {
        await api.post('/restaurant-admin/foods', formData);
        toast.success('Food created successfully');
      }
      fetchData();
      setShowForm(false);
      setEditingFood(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        preparationTime: 20,
        isAvailable: true,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving food');
    }
  };

  const handleEdit = (food) => {
    setEditingFood(food);
    setFormData({
      name: food.name,
      description: food.description,
      price: food.price,
      category: food.category._id,
      image: food.image,
      preparationTime: food.preparationTime,
      isAvailable: food.isAvailable,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this food?')) {
      try {
        await api.delete(`/restaurant-admin/foods/${id}`);
        toast.success('Food deleted successfully');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error deleting food');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Manage Foods</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : 'Add Food'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="admin-form">
            <h2>{editingFood ? 'Edit Food' : 'Add New Food'}</h2>
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
                rows="3"
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
            <button type="submit" className="btn-primary">
              {editingFood ? 'Update' : 'Create'}
            </button>
          </form>
        )}

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {foods.map((food) => (
                <tr key={food._id}>
                  <td>
                    {food.image ? (
                      <img src={food.image} alt={food.name} className="food-thumb" />
                    ) : (
                      <div className="food-thumb-placeholder">No Image</div>
                    )}
                  </td>
                  <td>{food.name}</td>
                  <td>${food.price}</td>
                  <td>{food.category?.name}</td>
                  <td>
                    <span className={food.isAvailable ? 'status-active' : 'status-inactive'}>
                      {food.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleEdit(food)} className="btn-edit">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(food._id)} className="btn-delete">
                      Delete
                    </button>
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

export default RestaurantAdminFoods;

