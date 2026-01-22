import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './Admin.css';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [showAssignManager, setShowAssignManager] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    phone: '',
    deliveryTime: 30,
    isActive: true,
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const getManagerName = (admin) => {
    if (!admin) return null;
    
    // If admin is an object with name or email
    if (typeof admin === 'object' && admin !== null) {
      return admin.name || admin.email || null;
    }
    
    // If admin is just an ID string, return null (should be populated by backend)
    return null;
  };

  const fetchRestaurants = async () => {
    try {
      const response = await api.get('/restaurants');
      const restaurantsData = response.data.restaurants || [];
      setRestaurants(restaurantsData);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      toast.error('Failed to fetch restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRestaurant) {
        await api.put(`/restaurants/${editingRestaurant._id}`, formData);
        toast.success('Restaurant updated successfully!');
      } else {
        await api.post('/restaurants', formData);
        toast.success('Restaurant created successfully!');
      }
      setShowForm(false);
      setEditingRestaurant(null);
      resetForm();
      fetchRestaurants();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save restaurant');
    }
  };

  const handleEdit = (restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      description: restaurant.description,
      image: restaurant.image,
      address: restaurant.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
      },
      phone: restaurant.phone,
      deliveryTime: restaurant.deliveryTime,
      isActive: restaurant.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this restaurant?')) {
      try {
        await api.delete(`/restaurants/${id}`);
        toast.success('Restaurant deleted successfully!');
        fetchRestaurants();
      } catch (error) {
        toast.error('Failed to delete restaurant');
      }
    }
  };

  const handleAssignManager = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    setSelectedUserId('');
    setLoadingUsers(true);
    setShowAssignManager(true);
    
    try {
      const response = await api.get('/users');
      // Filter to show users that can be assigned as managers (exclude delivery partners and superAdmin)
      const assignableUsers = response.data.users.filter(
        user => user.role !== 'delivery' && user.role !== 'superAdmin'
      );
      setUsers(assignableUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
      setShowAssignManager(false);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAssignManagerSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedUserId) {
      toast.error('Please select a user to assign as manager');
      return;
    }

    try {
      await api.post(`/restaurants/${selectedRestaurant._id}/assign-manager`, {
        userId: selectedUserId,
      });
      toast.success('Manager assigned successfully!');
      setShowAssignManager(false);
      setSelectedRestaurant(null);
      setSelectedUserId('');
      fetchRestaurants();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign manager');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
      },
      phone: '',
      deliveryTime: 30,
      isActive: true,
    });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Manage Restaurants</h1>
          <button
            className="btn-add"
            onClick={() => {
              setShowForm(!showForm);
              setEditingRestaurant(null);
              resetForm();
            }}
          >
            {showForm ? 'Cancel' : 'Add Restaurant'}
          </button>
        </div>

        {showForm && (
          <div className="admin-form">
            <h2>{editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}</h2>
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
                <label>Image URL</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Delivery Time (minutes)</label>
                <input
                  type="number"
                  name="deliveryTime"
                  value={formData.deliveryTime}
                  onChange={handleChange}
                  min="1"
                />
              </div>
              <h3>Address</h3>
              <div className="form-group">
                <label>Street</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Zip Code</label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  Active
                </label>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingRestaurant ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRestaurant(null);
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
                <th>Phone</th>
                <th>City</th>
                <th>Delivery Time</th>
                <th>Manager</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((restaurant) => (
                <tr key={restaurant._id}>
                  <td>{restaurant.name}</td>
                  <td>{restaurant.phone || 'N/A'}</td>
                  <td>{restaurant.address?.city || 'N/A'}</td>
                  <td>{restaurant.deliveryTime} min</td>
                  <td>
                    {(() => {
                      const managerName = getManagerName(restaurant.admin);
                      if (managerName) {
                        return (
                          <span style={{ color: '#28a745', fontWeight: '500' }}>
                            {managerName}
                          </span>
                        );
                      } else {
                        return (
                          <span style={{ color: '#999', fontStyle: 'italic' }}>Not assigned</span>
                        );
                      }
                    })()}
                  </td>
                  <td>{restaurant.isActive ? 'Yes' : 'No'}</td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className="admin-button btn-edit"
                        onClick={() => handleEdit(restaurant)}
                      >
                        Edit
                      </button>
                      <button
                        className="admin-button"
                        style={{ backgroundColor: '#ff6b35', margin: '0 4px' }}
                        onClick={() => handleAssignManager(restaurant)}
                      >
                        Assign Manager
                      </button>
                      <button
                        className="admin-button btn-delete"
                        onClick={() => handleDelete(restaurant._id)}
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

        {/* Assign Manager Modal */}
        {showAssignManager && (
          <div className="modal-overlay" onClick={() => setShowAssignManager(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Assign Manager to {selectedRestaurant?.name}</h2>
                <button
                  className="modal-close"
                  onClick={() => {
                    setShowAssignManager(false);
                    setSelectedRestaurant(null);
                    setSelectedUserId('');
                  }}
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleAssignManagerSubmit}>
                <div className="form-group">
                  <label>Select User</label>
                  {loadingUsers ? (
                    <div>Loading users...</div>
                  ) : (
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        fontSize: '14px',
                      }}
                    >
                      <option value="">-- Select a user --</option>
                      {users.map((user) => (
                        <option key={user._id || user.id} value={user._id || user.id}>
                          {user.name} ({user.email}) {user.role === 'manager' ? '- Current Manager' : ''}
                        </option>
                      ))}
                    </select>
                  )}
                  <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                    Note: Selected user will be assigned the manager role for this restaurant.
                  </small>
                </div>
                <div className="form-actions" style={{ marginTop: '20px' }}>
                  <button type="submit" className="btn-submit">
                    Assign Manager
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => {
                      setShowAssignManager(false);
                      setSelectedRestaurant(null);
                      setSelectedUserId('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Restaurants;

