import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import VendorRegistration from './pages/VendorRegistration';
import Banners from './pages/Banners';
import Subscriptions from './pages/Subscriptions';
import Services from './pages/Services';
import Staff from './pages/Staff';
import Packages from './pages/Packages';
import Users from './pages/Users';
import Countries from './pages/Countries';
import States from './pages/States';
import Destinations from './pages/Destinations';
import Categories from './pages/Categories';
import SubServices from './pages/SubServices';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ChangePassword from './pages/ChangePassword';
import Blogs from './pages/Blogs';
import Testimonials from './pages/Testimonials';
import SubmitTestimonial from './pages/SubmitTestimonial';
import VendorView from './pages/VendorView';
import Bookings from './pages/Bookings';
import Payments from './pages/Payments';
import UserView from './pages/UserView';
import Layout from './components/Layout';
import DestinationLayout from './components/DestinationLayout';
import { ToastProvider } from './context/ToastContext';
import { ConfirmDialogProvider } from './context/ConfirmDialogContext';
import { UIProvider } from './context/UIContext';
import { useSelector } from 'react-redux';

const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);
  if (!user) return <Navigate to="/dashboard" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <UIProvider>
      <ConfirmDialogProvider>
        <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/submit-testimonial" element={<SubmitTestimonial />} />
            
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="vendors" element={<Vendors />} />
              <Route path="vendors/create" element={<VendorRegistration />} />
              <Route path="vendors/edit/:id" element={<VendorRegistration />} />
              <Route path="vendors/view/:id" element={<VendorView />} />
              <Route path="banners" element={<Banners />} />
              <Route path="subscriptions" element={<Subscriptions />} />
              <Route path="services" element={<Services />} />
              <Route path="categories" element={<Categories />} />
              <Route path="sub-services" element={<SubServices />} />
              <Route path="staff" element={
                <RoleRoute allowedRoles={['Admin']}>
                  <Staff />
                </RoleRoute>
              } />
              <Route path="users" element={<Users />} />
              <Route path="users/view/:id" element={<UserView />} />
              <Route path="packages" element={<Packages />} />
              
              <Route path="destinations" element={<DestinationLayout />}>
                <Route index element={<Navigate to="countries" replace />} />
                <Route path="countries" element={<Countries />} />
                <Route path="states" element={<States />} />
                <Route path="list" element={<Destinations />} />
              </Route>

              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="change-password" element={<ChangePassword />} />
              <Route path="blogs" element={<Blogs />} />
              <Route path="testimonials" element={<Testimonials />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="payments" element={<Payments />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </ConfirmDialogProvider>
    </UIProvider>
  );
}

export default App;
