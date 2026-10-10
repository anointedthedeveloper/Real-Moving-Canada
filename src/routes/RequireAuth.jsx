import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { REQUIRE_AUTH } from '../services/config.js';
import Spinner from '../components/common/Spinner.jsx';

/**
 * Guards the customer portal: visitors who aren't signed in are sent to /login and
 * brought back to the page they wanted afterwards. (VITE_REQUIRE_AUTH=false turns
 * the guard off for previewing the screens without the API.)
 */
export default function RequireAuth() {
  const { user, checking } = useAuth();
  const location = useLocation();
  if (!REQUIRE_AUTH) return <Outlet />;
  if (checking) return <div className="page-loading"><Spinner size={28} label="Checking your session…" /></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
