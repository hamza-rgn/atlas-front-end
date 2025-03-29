import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const PublicLandingPage = () => {
  const { slug } = useParams();
  const [landingPage, setLandingPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    clt_fullname: '',
    clt_tel: '',
    clt_address: ''
  });

  useEffect(() => {
    const fetchLandingPage = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/api/landingpageslug/${slug}`);
        setLandingPage(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Page not found');
      } finally {
        setLoading(false);
      }
    };

    fetchLandingPage();
  }, [slug]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the formData to your backend
    console.log('Form submitted:', formData);
    alert('Order submitted successfully!');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!landingPage) return <div className="text-center">No page found</div>;

  return (
    <div className="public-landing-page">
      <div 
        className="landing-page-content" 
        dangerouslySetInnerHTML={{ __html: landingPage.content }} 
      />
      
      <form id="form" onSubmit={handleSubmit} className="simple-order-form">
        <h3>Create Order</h3>
        <div className="form-group">
          <label htmlFor="clt_fullname">Full Name</label>
          <input
            type="text"
            id="clt_fullname"
            name="clt_fullname"
            value={formData.clt_fullname}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="clt_tel">Phone Number</label>
          <input
            type="tel"
            id="clt_tel"
            name="clt_tel"
            value={formData.clt_tel}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="clt_address">Address</label>
          <textarea
            id="clt_address"
            name="clt_address"
            value={formData.clt_address}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="submit-btn">Submit Order</button>
      </form>
    </div>
  );
};

export default PublicLandingPage;