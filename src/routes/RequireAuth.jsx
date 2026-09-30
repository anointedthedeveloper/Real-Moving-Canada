import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { REQUIRE_AUTH } from '../services/config.js';
import Spinner from '../components/common/Spinner.jsx';

/**
 * Guards the customer portal. When VITE_REQUIRE_AUTH=true, visitors who aren't
 * signed in are sent to /login and returned afterwards. Until accounts exist the
 * guard is off and the portal renders as a clearly labelled preview.
 */
export default function RequireAuth() {
  const { user, checking } = useAuth();
  const location = useLocation();
  if (!REQUIRE_AUTH) return <Outlet />;
  if (checking) return <div className="page-loading"><Spinner size={28} label="Checking your session…" /></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
