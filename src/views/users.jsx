import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { user: currentAuthUser, api } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'user'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!currentUser && !formData.password) newErrors.password = 'Password is required';
    if (formData.password && formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = { ...formData };
      // Don't send password if it's empty during update
      if (currentUser && !payload.password) {
        delete payload.password;
      }

      if (currentUser) {
        await api.put(`/users/${currentUser._id}`, payload);
      } else {
        await api.post('/users', payload);
      }
      
      fetchUsers();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving user:', error);
      alert(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      password: '',
      role: user.role
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    // Prevent deleting yourself
    if (id === currentAuthUser._id) {
      alert('You cannot delete your own account');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      username: '',
      password: '',
      role: 'user'
    });
    setCurrentUser(null);
    setErrors({});
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container">
      <div className="table-header">
        <h1 className="page-title">Users</h1>
        {currentAuthUser?.role === 'admin' && (
          <button 
            className="create-btn"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
          >
            <i className="fas fa-plus"></i> Create User
          </button>
        )}
      </div>
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                {currentAuthUser?.role === 'admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.username}</td>
                  <td>
                    <span className={`badge ${user.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                      {user.role}
                    </span>
                  </td>
                  {currentAuthUser?.role === 'admin' && (
                    <td className="actions-container">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEdit(user)}
                        disabled={user._id === currentAuthUser._id}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(user._id)}
                        disabled={user._id === currentAuthUser._id}
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </td>
                  )}
                </tr>
              )) : (
                <tr>
                  <td colSpan={currentAuthUser?.role === 'admin' ? 4 : 3} className="text-center">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {currentAuthUser?.role === 'admin' && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={currentUser ? 'Edit User' : 'Create User'}
        >
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className={errors.username ? 'error' : ''}
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>
            <div className="form-group">
              <label>Password {currentUser && '(leave blank to keep unchanged)'}</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required={!currentUser}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                disabled={currentUser?._id === currentAuthUser._id}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
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
                {currentUser ? 'Update User' : 'Create User'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Users;