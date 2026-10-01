import { BrowserRouter } from 'react-router-dom';
import ScrollToTop from './components/common/ScrollToTop.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';
import { usePrefetchRoutes } from './hooks/usePrefetchRoutes.js';

export default function App() {
  usePrefetchRoutes();
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
