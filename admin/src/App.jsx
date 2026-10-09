import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import VendorRegistration from './pages/VendorRegistration';
import VendorBanks from './pages/VendorBanks';
import Banners from './pages/Banners';
import Subscriptions from './pages/Subscriptions';
import Services from './pages/Services';
import Staff from './pages/Staff';
import Packages from './pages/Packages';
import PackageCreate from './pages/PackageCreate';
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
import Complaints from './pages/Complaints';
import UserView from './pages/UserView';
import Shows from './pages/Shows';
import Policies from './pages/Policies';
import Enquiries from './pages/Enquiries';
import ContactUs from './pages/ContactUs';
import Brands from './pages/Brands';
import Coupons from './pages/Coupons';
import PremiumFormBuilder from './pages/PremiumFormBuilder';
import PackageSetup from './pages/PackageSetup';
import NextGenFormBuilder from './pages/NextGenFormBuilder';
import NextGenFormbuild, { NextGenPreview } from './pages/NextGenFormbuild';

import ProfileSettings from './pages/settings/ProfileSettings';
import GeneralSettings from './pages/settings/GeneralSettings';
import SecuritySettings from './pages/settings/SecuritySettings';
import PermissionsSettings from './pages/settings/PermissionsSettings';
import PaymentSettings from './pages/settings/PaymentSettings';
import StaffRoles from './pages/StaffRoles';

import Layout from './components/Layout';
import DestinationLayout from './components/DestinationLayout';
import { ToastProvider } from './context/ToastContext';
import { ConfirmDialogProvider } from './context/ConfirmDialogContext';
import { UIProvider } from './context/UIContext';
import SecurityMonitor from './components/SecurityMonitor';
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
          <SecurityMonitor />
          <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/vendor-register" element={<VendorRegistration isPublic={true} />} />
            <Route path="/submit-testimonial" element={<SubmitTestimonial />} />
            
            {/* Immersive AI Builder (Outside Layout) */}
            <Route path="packages/ai-builder/:customId" element={<NextGenFormbuild />} />
            <Route path="preview" element={<NextGenPreview />} />
            
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="vendors" element={<Vendors />} />
              <Route path="vendor-banks" element={<VendorBanks />} />
              <Route path="vendors/banks" element={<VendorBanks />} />
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
              <Route path="packages/create" element={<PackageCreate />} />
              <Route path="packages/create/:serviceId" element={<PackageCreate />} />
              <Route path="packages/edit/:id" element={<PackageCreate />} />
              <Route path="packages/:customId/:serviceName" element={<Packages />} />
              <Route path="packages/setup" element={<PackageSetup />} />
              <Route path="packages/setup/:serviceId" element={<PremiumFormBuilder />} />
              <Route path="packages/coupons" element={<Coupons />} />
              <Route path="coupons" element={<Coupons />} />

              
              <Route path="destinations" element={<DestinationLayout />}>
                <Route index element={<Navigate to="countries" replace />} />
                <Route path="countries" element={<Countries />} />
                <Route path="states" element={<States />} />
                <Route path="list" element={<Destinations />} />
              </Route>

              <Route path="profile" element={<ProfileSettings />} />
              <Route path="settings" element={<Navigate to="/settings/profile" replace />} />
              <Route path="settings/profile" element={<ProfileSettings />} />
              <Route path="settings/general" element={<GeneralSettings />} />
              <Route path="settings/security" element={<SecuritySettings />} />
              <Route path="settings/payments" element={<PaymentSettings />} />
              <Route path="admin/settings/payments" element={<PaymentSettings />} />
              <Route path="settings/permissions" element={
                <RoleRoute allowedRoles={['Admin']}>
                  <PermissionsSettings />
                </RoleRoute>
              } />
              <Route path="staff-roles" element={
                <RoleRoute allowedRoles={['Admin']}>
                  <StaffRoles />
                </RoleRoute>
              } />
              <Route path="roles" element={
                <RoleRoute allowedRoles={['Admin']}>
                  <StaffRoles />
                </RoleRoute>
              } />
              <Route path="permissions" element={
                <RoleRoute allowedRoles={['Admin']}>
                  <PermissionsSettings />
                </RoleRoute>
              } />
              <Route path="roles-permissions" element={
                <RoleRoute allowedRoles={['Admin']}>
                  <PermissionsSettings />
                </RoleRoute>
              } />
              <Route path="bookings" element={<Bookings />} />
              <Route path="payments" element={<Payments />} />
              <Route path="complaints" element={<Complaints />} />
              <Route path="policies" element={<Policies />} />

              {/* Convenience route aliases */}
              <Route path="enquiries" element={<Navigate to="/website/enquiries" replace />} />
              <Route path="contact" element={<Navigate to="/website/contact-us" replace />} />
              <Route path="contacts" element={<Navigate to="/website/contact-us" replace />} />
              <Route path="contact-us" element={<Navigate to="/website/contact-us" replace />} />
              <Route path="testimonials" element={<Navigate to="/website/testimonials" replace />} />
              <Route path="reviews" element={<Navigate to="/website/testimonials" replace />} />

              {/* Website Management (Staff) */}
              <Route path="website">
                <Route path="banners" element={<Banners userRole="Admin" />} />
                <Route path="blogs" element={<Blogs userRole="Admin" />} />
                <Route path="testimonials" element={<Testimonials userRole="Admin" />} />
                <Route path="shows" element={<Shows userRole="Admin" />} />
                <Route path="brands" element={<Brands userRole="Admin" />} />
                <Route path="enquiries" element={<Enquiries />} />
                <Route path="contact-us" element={<ContactUs />} />
              </Route>

              {/* Vendor Hub (Vendors) */}
              <Route path="vendor">
                <Route path="banners" element={<Banners userRole="Vendor" />} />
                <Route path="blogs" element={<Blogs userRole="Vendor" />} />
                <Route path="testimonials" element={<Testimonials userRole="Vendor" />} />
                <Route path="shows" element={<Shows userRole="Vendor" />} />
                <Route path="brands" element={<Brands userRole="Vendor" />} />
              </Route>
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
