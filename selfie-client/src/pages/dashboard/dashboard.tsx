import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth-context';

const Dashboard = (): ReactElement => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};


