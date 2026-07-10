// App.jsx - Fully updated with SocketProvider integration and Notifications route
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import CookieConsent from './components/common/CookieConsent';
import ProtectedRoute from './components/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';

// ✅ Admin Pages - Correct imports from admin folder
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTours from './pages/admin/AdminTours';
import AdminHotels from './pages/admin/AdminHotels';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDestinations from './pages/admin/AdminDestinations';
import AdminRevenue from './pages/admin/AdminRevenue';
import AdminContact from './pages/admin/AdminContact';
import AdminSettings from './pages/admin/AdminSettings';
import AdminProfile from './pages/admin/AdminProfile';
import AdminReviews from './pages/admin/AdminReviews';

// ✅ User Pages - Correct imports from user folder
import UserDashboard from './pages/user/UserDashboard';
import UserBookings from './pages/user/UserBookings';
import UserFavorites from './pages/user/UserFavorites';
import UserProfile from './pages/user/UserProfile';
import UserSettings from './pages/user/UserSettings';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Tours from './pages/Tours';
import Hotels from './pages/Hotels';
import Contact from './pages/Contact';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import TourDetails from './components/tours/TourDetails';
import HotelDetails from './components/hotels/HotelDetails';
import BookingForm from './components/tours/BookingForm';
import Favorites from './pages/Favorites';
import GhanaMap from './pages/GhanaMap';
import Team from './pages/Team';
import Careers from './pages/Careers';
import Help from './pages/Help';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiePolicy from './pages/CookiePolicy';
import TermsOfService from './pages/TermsOfService';
import Security from './pages/Security';
import AccessibilityPage from './pages/Accessibility';
import FAQ from './pages/FAQ';
import Feedback from './pages/Feedback';
import Chat from './pages/Chat';
import Investors from './pages/Investors';
import PressKit from './pages/PressKit';
import WellnessRetreats from './pages/services/WellnessRetreats';
import MedicalTourism from './pages/services/MedicalTourism';
import CorporateWellness from './pages/services/CorporateWellness';
import SpecialPrograms from './pages/services/SpecialPrograms';
import CulturalTourism from './pages/services/CulturalTourism';
import Destinations from './pages/Destinations';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// ✅ NOTIFICATIONS PAGE - Add this import
import Notifications from './pages/Notifications';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id'}>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <SocketProvider>
              <BookingProvider>
                <NotificationProvider>
                  <Routes>
                    {/* ==================== PUBLIC ROUTES ==================== */}
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/destinations" element={<Destinations />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/tours" element={<Tours />} />
                    <Route path="/tour/:id" element={<TourDetails />} />
                    <Route path="/hotels" element={<Hotels />} />
                    <Route path="/hotel/:id" element={<HotelDetails />} />
                    <Route path="/book/:id" element={<BookingForm />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/map" element={<GhanaMap />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* ==================== COMPANY PAGES ==================== */}
                    <Route path="/team" element={<Team />} />
                    <Route path="/careers" element={<Careers />} />
                    <Route path="/investors" element={<Investors />} />
                    <Route path="/press" element={<PressKit />} />
                    
                    {/* ==================== SUPPORT PAGES ==================== */}
                    <Route path="/help" element={<Help />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/feedback" element={<Feedback />} />
                    <Route path="/chat" element={<Chat />} />
                    
                    {/* ==================== SERVICE PAGES ==================== */}
                    <Route path="/services/wellness" element={<WellnessRetreats />} />
                    <Route path="/services/medical" element={<MedicalTourism />} />
                    <Route path="/services/corporate" element={<CorporateWellness />} />
                    <Route path="/services/special" element={<SpecialPrograms />} />
                    <Route path="/services/cultural" element={<CulturalTourism />} />
                    
                    {/* ==================== LEGAL PAGES ==================== */}
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/cookies" element={<CookiePolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/security" element={<Security />} />
                    <Route path="/accessibility" element={<AccessibilityPage />} />
                    
                    {/* ==================== PROTECTED ROUTES ==================== */}
                    
                    {/* Favorites - Protected */}
                    <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                    
                    {/* ✅ NOTIFICATIONS - Protected route */}
                    <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                    
                    {/* ==================== USER DASHBOARD ==================== */}
                    <Route path="/dashboard" element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
                      <Route index element={<UserDashboard />} />
                      <Route path="bookings" element={<UserBookings />} />
                      <Route path="favorites" element={<UserFavorites />} />
                      <Route path="profile" element={<UserProfile />} />
                      <Route path="settings" element={<UserSettings />} />
                      <Route path="experiences" element={<UserDashboard />} />
                      {/* ✅ Notifications inside user dashboard (optional) */}
                      <Route path="notifications" element={<Notifications />} />
                    </Route>
                    
                    {/* ==================== ADMIN DASHBOARD ==================== */}
                    <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="tours" element={<AdminTours />} />
                      <Route path="hotels" element={<AdminHotels />} />
                      <Route path="bookings" element={<AdminBookings />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="security" element={<AdminSettings />} />
                      <Route path="help" element={<AdminSettings />} />
                      <Route path="users" element={<AdminUsers />} />
                      <Route path="contact" element={<AdminContact />} />
                      <Route path="profile" element={<AdminProfile />} />
                      <Route path="reviews" element={<AdminReviews />} />
                      <Route path="destinations" element={<AdminDestinations />} />
                      <Route path="revenue" element={<AdminRevenue />} />
                      <Route path="analytics" element={<AdminDashboard />} />
                      {/* ✅ Admin notifications */}
                      <Route path="notifications" element={<Notifications />} />
                    </Route>
                    
                    {/* ==================== FALLBACK ROUTE ==================== */}
                    <Route path="*" element={<Home />} />
                  </Routes>
                  
                  <CookieConsent />
                </NotificationProvider>
              </BookingProvider>
            </SocketProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;