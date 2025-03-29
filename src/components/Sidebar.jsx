import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  
  return (
    <>
      <div className={`sidebar ${isOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <h1>Admin Panel</h1>
        </div>
        <nav className="sidebar-nav">
          <div> 
            <NavLink 
              to="/orders" 
              className={({ isActive }) => 
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <span className="flex items-center">
                <i className="fas fa-list-alt mr-3"></i>
                <span className="link-text">Orders</span>
              </span>
            </NavLink>
            
            {user?.role === 'admin' && (
              <>
                <NavLink 
                  to="/landingpage" 
                  className={({ isActive }) => 
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  onClick={onClose}
                >
                  <span className="flex items-center">
                    <i className="fas fa-globe mr-3"></i>
                    <span className="link-text">Landing Pages</span>
                  </span>
                </NavLink>
                <NavLink 
                  to="/users" 
                  className={({ isActive }) => 
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  onClick={onClose}
                >
                  <span className="flex items-center">
                    <i className="fas fa-users mr-3"></i>
                    <span className="link-text">Users</span>
                  </span>
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </div>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
    </>
  );
};

export default Sidebar;