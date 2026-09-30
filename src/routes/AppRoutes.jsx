import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';
import AuthLayout from '../layouts/AuthLayout.jsx';
import QuoteLayout from '../layouts/QuoteLayout.jsx';
import DashboardLayout from '../layouts/DashboardLayout.jsx';
import RequireAuth from './RequireAuth.jsx';
import PageSkeleton from '../components/common/PageSkeleton.jsx';
import HomePage from '../pages/public/HomePage.jsx';
import NotFoundPage from '../pages/public/NotFoundPage.jsx';

// Everything except the home page is code-split so the first load stays small.
const ServicesPage = lazy(() => import('../pages/public/ServicesPage.jsx'));
const ServiceDetailPage = lazy(() => import('../pages/public/ServiceDetailPage.jsx'));
const AboutPage = lazy(() => import('../pages/public/AboutPage.jsx'));
const ContactPage = lazy(() => import('../pages/public/ContactPage.jsx'));
const PricingPage = lazy(() => import('../pages/public/PricingPage.jsx'));
const ServiceAreasPage = lazy(() => import('../pages/public/ServiceAreasPage.jsx'));
const ReviewsPage = lazy(() => import('../pages/public/ReviewsPage.jsx'));
const LegalPage = lazy(() => import('../pages/public/LegalPage.jsx'));
const QuotePage = lazy(() => import('../pages/public/QuotePage.jsx'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage.jsx'));
const SignupPage = lazy(() => import('../pages/auth/SignupPage.jsx'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage.jsx'));
const ResetPasswordPage = lazy(() => import('../pages/auth/ResetPasswordPage.jsx'));
const SignedOutPage = lazy(() => import('../pages/auth/SignedOutPage.jsx'));
const OverviewPage = lazy(() => import('../pages/dashboard/OverviewPage.jsx'));
const MovesPage = lazy(() => import('../pages/dashboard/MovesPage.jsx'));
const QuotesPage = lazy(() => import('../pages/dashboard/QuotesPage.jsx'));
const BookingsPage = lazy(() => import('../pages/dashboard/BookingsPage.jsx'));
const PaymentsPage = lazy(() => import('../pages/dashboard/PaymentsPage.jsx'));
const MakePaymentPage = lazy(() => import('../pages/dashboard/MakePaymentPage.jsx'));
const DocumentsPage = lazy(() => import('../pages/dashboard/DocumentsPage.jsx'));
const MessagesPage = lazy(() => import('../pages/dashboard/MessagesPage.jsx'));
const ProfilePage = lazy(() => import('../pages/dashboard/ProfilePage.jsx'));
const SettingsPage = lazy(() => import('../pages/dashboard/SettingsPage.jsx'));

/**
 * Wraps a lazily loaded page so only the page area shows a skeleton of the
 * page shape while its code downloads — the header, sidebar and footer stay put.
 */
const withSkeleton = (variant) => (Component, props) => (
  <Suspense fallback={<PageSkeleton variant={variant} />}><Component {...props} /></Suspense>
);
const page = withSkeleton('public');
const authPage = withSkeleton('auth');
const quotePage = withSkeleton('quote');
const portalPage = withSkeleton('dashboard');

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="home" element={<Navigate to="/" replace />} />
        <Route path="services" element={page(ServicesPage)} />
        <Route path="services/:serviceId" element={page(ServiceDetailPage)} />
        <Route path="about" element={page(AboutPage)} />
        <Route path="contact" element={page(ContactPage)} />
        <Route path="pricing" element={page(PricingPage)} />
        <Route path="service-areas" element={page(ServiceAreasPage)} />
        <Route path="reviews" element={page(ReviewsPage)} />
        <Route path="privacy" element={page(LegalPage, { kind: 'privacy' })} />
        <Route path="terms" element={page(LegalPage, { kind: 'terms' })} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<QuoteLayout />}>
        <Route path="quote" element={quotePage(QuotePage)} />
        <Route path="book" element={<Navigate to="/quote" replace />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="login" element={authPage(LoginPage)} />
        <Route path="signup" element={authPage(SignupPage)} />
        <Route path="forgot-password" element={authPage(ForgotPasswordPage)} />
        <Route path="reset-password" element={authPage(ResetPasswordPage)} />
        <Route path="signed-out" element={authPage(SignedOutPage)} />
      </Route>

      <Route path="dashboard" element={<RequireAuth />}>
        <Route element={<DashboardLayout />}>
          <Route index element={portalPage(OverviewPage)} />
          <Route path="moves" element={portalPage(MovesPage)} />
          <Route path="quotes" element={portalPage(QuotesPage)} />
          <Route path="bookings" element={portalPage(BookingsPage)} />
          <Route path="payments" element={portalPage(PaymentsPage)} />
          <Route path="payments/pay" element={portalPage(MakePaymentPage)} />
          <Route path="documents" element={portalPage(DocumentsPage)} />
          <Route path="messages" element={portalPage(MessagesPage)} />
          <Route path="profile" element={portalPage(ProfilePage)} />
          <Route path="settings" element={portalPage(SettingsPage)} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
