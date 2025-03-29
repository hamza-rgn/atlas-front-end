import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Landingpage from './views/landingpage';
import Orders from './views/orders';
import Users from './views/users';
import PublicLandingPage from './views/PublicLandingPage';
import Login from './views/login';
import Layout from './components/Layout';


function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/landingpage/:slug" element={<PublicLandingPage />} />
      <Route element={<Layout />}>
        <Route path="/landingpage" element={
          <ProtectedRoute adminOnly>
            <Landingpage />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute adminOnly>
            <Users />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

export default AppRoutes;