import React from 'react';
import { Link } from 'react-router-dom';
import './Careers.css';

const Careers = () => {
  const jobOpenings = [
    {
      title: 'Senior Full Stack Developer',
      department: 'Engineering',
      location: 'Mumbai, Remote',
      type: 'Full-time',
      description: 'Build and maintain scalable food delivery platform',
    },
    {
      title: 'Product Manager',
      department: 'Product',
      location: 'Delhi',
      type: 'Full-time',
      description: 'Drive product strategy and roadmap',
    },
    {
      title: 'Customer Support Executive',
      department: 'Operations',
      location: 'Bangalore',
      type: 'Full-time',
      description: 'Help customers and resolve queries',
    },
    {
      title: 'Marketing Specialist',
      department: 'Marketing',
      location: 'Mumbai, Remote',
      type: 'Full-time',
      description: 'Create engaging campaigns and drive growth',
    },
    {
      title: 'Business Development Manager',
      department: 'Business',
      location: 'Pune',
      type: 'Full-time',
      description: 'Onboard restaurants and expand partnerships',
    },
    {
      title: 'UI/UX Designer',
      department: 'Design',
      location: 'Remote',
      type: 'Full-time',
      description: 'Design beautiful and intuitive user experiences',
    },
  ];

  const benefits = [
    { icon: '💰', title: 'Competitive Salary', desc: 'Best in industry compensation' },
    { icon: '🏥', title: 'Health Insurance', desc: 'Comprehensive health coverage' },
    { icon: '🏖️', title: 'Flexible Leave', desc: 'Paid time off and sick leave' },
    { icon: '📚', title: 'Learning & Growth', desc: 'Training and development programs' },
    { icon: '🏠', title: 'Remote Work', desc: 'Flexible remote work options' },
    { icon: '🎉', title: 'Fun Culture', desc: 'Team events and celebrations' },
  ];

  return (
    <div className="careers-page">
      <div className="careers-hero">
        <div className="container">
          <h1>Join the Foodie Team</h1>
          <p className="hero-subtitle">Build the future of food delivery with us</p>
        </div>
      </div>

      <div className="container">
        <section className="careers-intro">
          <h2>Why Work at Foodie?</h2>
          <p>
            At Foodie, we're not just delivering food – we're building a platform that connects communities, 
            supports local businesses, and creates opportunities. Join a dynamic team of passionate individuals 
            who are reshaping the food delivery landscape.
          </p>
        </section>

        <section className="benefits-section">
          <h2>Benefits & Perks</h2>
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <div className="benefit-icon">{benefit.icon}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="openings-section">
          <h2>Open Positions</h2>
          <div className="jobs-list">
            {jobOpenings.map((job, index) => (
              <div key={index} className="job-card">
                <div className="job-header">
                  <div>
                    <h3>{job.title}</h3>
                    <div className="job-meta">
                      <span className="job-dept">{job.department}</span>
                      <span className="job-location">📍 {job.location}</span>
                      <span className="job-type">{job.type}</span>
                    </div>
                  </div>
                  <button className="apply-button">Apply Now</button>
                </div>
                <p className="job-description">{job.description}</p>
              </div>
            ))}
          </div>

          <div className="no-match">
            <p>Don't see a role that fits? We're always looking for talented people!</p>
            <Link to="/contact" className="btn-secondary">Get in Touch</Link>
          </div>
        </section>

        <section className="culture-section">
          <h2>Our Culture</h2>
          <div className="culture-content">
            <div className="culture-item">
              <h3>🚀 Innovation First</h3>
              <p>We encourage creativity and new ideas. Every team member has a voice.</p>
            </div>
            <div className="culture-item">
              <h3>👥 Team Collaboration</h3>
              <p>Work with talented people across different departments and backgrounds.</p>
            </div>
            <div className="culture-item">
              <h3>📈 Growth Opportunities</h3>
              <p>Continuous learning and career development support.</p>
            </div>
            <div className="culture-item">
              <h3>⚖️ Work-Life Balance</h3>
              <p>We believe in sustainable work practices and employee well-being.</p>
            </div>
          </div>
        </section>

        <div className="back-home">
          <Link to="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Careers;

