import { useAuth } from '../context/AuthContext';

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  
  return (
    <header className="header">
      <div className="header-content">
        <button className="mobile-menu-btn" onClick={onMenuClick}>
          <i className="fas fa-bars"></i>
        </button>
        <h2 className="header-title">Dashboard</h2>
        <div className="user-menu">
          <span className="user-name">{user?.name}</span>
          <button onClick={logout} className="logout-btn">
            <i className="fas fa-sign-out-alt"></i>
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;