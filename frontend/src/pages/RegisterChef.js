import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

const RegisterChef = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        kitchenName: '',
        bio: '',
        specialties: '',
        experience: '',
        fssaiLicenseNumber: '',
        fssaiLicenseImage: '', // In real app, this would be file upload
        idProofType: 'Aadhar',
        idProofImage: '', // In real app, file upload
        deliveryMode: 'platform',
        deliveryRadius: 5,
        deliveryCharges: 0,
        schedule: 'Mon-Sun: 9am - 9pm'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Convert specialties string to array
            const payload = {
                ...formData,
                specialties: formData.specialties.split(',').map(s => s.trim()),
                availability: {
                    isAvailable: true,
                    schedule: formData.schedule
                }
            };

            const res = await api.post('/chefs/register', payload);

            if (res.data.success) {
                // Update local user context if possible, or just redirect
                toast.success('🎉 Application Submitted! Pending Admin Approval.');
                navigate('/home-kitchen');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Become a Home Chef 👩‍🍳</h1>

            <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                {/* Basic Info */}
                <h3>Kitchen Details</h3>
                <div className="form-group mb-3">
                    <label>Kitchen Name *</label>
                    <input type="text" name="kitchenName" className="form-control" required value={formData.kitchenName} onChange={handleChange} placeholder="e.g. Mom's Magic Kitchen" />
                </div>

                <div className="form-group mb-3">
                    <label>Bio (Tell us your story)</label>
                    <textarea name="bio" className="form-control" rows="3" value={formData.bio} onChange={handleChange} placeholder="I have been cooking authentic Punjabi food for 10 years..."></textarea>
                </div>

                <div className="row">
                    <div className="col-md-6 form-group mb-3">
                        <label>Specialties (comma separated) *</label>
                        <input type="text" name="specialties" className="form-control" required value={formData.specialties} onChange={handleChange} placeholder="Dal Makhani, Butter Chicken, Roti" />
                    </div>
                    <div className="col-md-6 form-group mb-3">
                        <label>Experience (Years)</label>
                        <input type="text" name="experience" className="form-control" value={formData.experience} onChange={handleChange} placeholder="e.g. 5 years" />
                    </div>
                </div>

                <hr className="my-4" />

                {/* Verification Documents */}
                <h3>Verification Documents</h3>
                <div className="row">
                    <div className="col-md-6 form-group mb-3">
                        <label>FSSAI License Number</label>
                        <input type="text" name="fssaiLicenseNumber" className="form-control" value={formData.fssaiLicenseNumber} onChange={handleChange} />
                    </div>
                    <div className="col-md-6 form-group mb-3">
                        <label>ID Proof Type</label>
                        <select name="idProofType" className="form-control" value={formData.idProofType} onChange={handleChange}>
                            <option value="Aadhar">Aadhar Card</option>
                            <option value="PAN">PAN Card</option>
                            <option value="Driving License">Driving License</option>
                        </select>
                    </div>
                </div>
                {/* File Upload Placeholders */}
                <div className="alert alert-info">
                    Note: File upload functionality coming soon. For now, please enter dummy URLs if testing.
                </div>

                <hr className="my-4" />

                {/* Delivery Settings */}
                <h3>Delivery Settings</h3>
                <div className="form-group mb-3">
                    <label>Delivery Mode</label>
                    <select name="deliveryMode" className="form-control" value={formData.deliveryMode} onChange={handleChange}>
                        <option value="platform">Platform Delivery (Our Partners pick up)</option>
                        <option value="self">Self Delivery (You deliver)</option>
                    </select>
                </div>

                {formData.deliveryMode === 'self' && (
                    <div className="row">
                        <div className="col-md-6 form-group mb-3">
                            <label>Delivery Radius (km)</label>
                            <input type="number" name="deliveryRadius" className="form-control" value={formData.deliveryRadius} onChange={handleChange} />
                        </div>
                        <div className="col-md-6 form-group mb-3">
                            <label>Delivery Charge (₹)</label>
                            <input type="number" name="deliveryCharges" className="form-control" value={formData.deliveryCharges} onChange={handleChange} />
                        </div>
                    </div>
                )}

                <button type="submit" className="btn btn-primary w-100 btn-lg mt-3" disabled={loading}>
                    {loading ? 'Submitting Application...' : 'Submit Authorization Request'}
                </button>
            </form>
        </div>
    );
};

export default RegisterChef;
