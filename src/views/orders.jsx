import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const { user, api } = useAuth();

  const [formData, setFormData] = useState({
    clt_fullname: '',
    clt_tel: '',
    clt_address: '',
    city: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = user?.role === 'admin' ? '/orders' : `/orders?user_id=${user?._id}`;
      const response = await api.get(url);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentOrder) {
        // Update existing order
        await api.put(`/orders/${currentOrder._id}`, formData);
      } else {
        // Create new order
        await api.post('/orders', formData);
      }
      fetchOrders();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving order:', error);
      alert(error.response?.data?.message || 'Error saving order');
    }
  };

  const handleEdit = (order) => {
    setCurrentOrder(order);
    setFormData({
      clt_fullname: order.clt_fullname,
      clt_tel: order.clt_tel,
      clt_address: order.clt_address,
      city: order.city,
      status: order.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await api.delete(`/orders/${id}`);
        fetchOrders();
      } catch (error) {
        console.error('Error deleting order:', error);
        alert(error.response?.data?.message || 'Error deleting order');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      clt_fullname: '',
      clt_tel: '',
      clt_address: '',
      city: '',
      status: 'pending'
    });
    setCurrentOrder(null);
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container">
      <div className="table-header">
        <h1 className="page-title">Orders</h1>
        <button 
          className="create-btn"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <i className="fas fa-plus"></i> Create Order
        </button>
      </div>
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>City</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? orders.map((order) => (
                <tr key={order._id}>
                  <td>{order.clt_fullname}</td>
                  <td>{order.clt_tel}</td>
                  <td>{order.clt_address}</td>
                  <td>{order.city}</td>
                  <td>
                    <span className={`badge badge-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="actions-container">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(order)}
                    >
                      <i className="fas fa-edit"></i> Edit
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(order._id)}
                    >
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={currentOrder ? 'Edit Order' : 'Create New Order'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Client Name</label>
            <input
              type="text"
              name="clt_fullname"
              value={formData.clt_fullname}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="clt_tel"
              value={formData.clt_tel}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="clt_address"
              value={formData.clt_address}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
            />
          </div>
          {user?.role === 'admin' && (
            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {currentOrder ? 'Update Order' : 'Create Order'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Orders;