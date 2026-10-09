import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import AuthGuard from 'utils/route-guard/AuthGuard';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));
const DashboardAnalytics = Loadable(lazy(() => import('views/dashboard/Analytics')));
const DashboardReports = Loadable(lazy(() => import('views/dashboard/Reports')));

// platform routing
const PlatformBanners = Loadable(lazy(() => import('views/platform-management/Banners')));
const PlatformBlogs = Loadable(lazy(() => import('views/platform-management/Blogs')));
const PlatformTestimonials = Loadable(lazy(() => import('views/platform-management/Testimonials')));
const PlatformPolicies = Loadable(lazy(() => import('views/platform-management/Policies')));
const ServicesManagement = Loadable(lazy(() => import('views/services-management')));
const PackagesManagement = Loadable(lazy(() => import('views/services-management/PackagesManagement')));
const PlatformVendors = Loadable(lazy(() => import('views/platform-management/Vendors')));
const PlatformBookings = Loadable(lazy(() => import('views/platform-management/Bookings')));
const PlatformWallet = Loadable(lazy(() => import('views/platform-management/Wallet')));

// communication routing
const WebEnquiries = Loadable(lazy(() => import('views/communications/Enquiries')));
const WebContactUs = Loadable(lazy(() => import('views/communications/ContactUs')));
const CalendarPage = Loadable(lazy(() => import('views/calendar')));

const VendorSettings = Loadable(lazy(() => import('views/pages/settings')));
const SecuritySettings = Loadable(lazy(() => import('views/pages/settings/Security')));
const NotificationSettings = Loadable(lazy(() => import('views/pages/settings/Notifications')));
const VendorSubscriptionSettings = Loadable(lazy(() => import('views/pages/settings/Subscription')));
const ApiDocumentation = Loadable(lazy(() => import('views/platform-management/ApiDocumentation')));

// pages routing
const VendorPolicyView = Loadable(lazy(() => import('views/pages/policies/VendorPolicyView')));
const Error404 = Loadable(lazy(() => import('views/pages/maintenance/Error404')));
const Error500 = Loadable(lazy(() => import('views/pages/maintenance/Error500')));
const Error403 = Loadable(lazy(() => import('views/pages/maintenance/Error403')));
const MaintenancePage = Loadable(lazy(() => import('views/pages/maintenance/Maintenance')));

// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <AuthGuard>
      <MainLayout />
    </AuthGuard>
  ),
  errorElement: <Error500 />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      element: <DashboardDefault />
    },
    {
      path: 'calendar',
      element: <CalendarPage />
    },
    {
      path: 'analytics',
      element: <DashboardDefault />
    },
    {
      path: 'reports',
      element: <DashboardDefault />
    },
    {
      path: 'privacy-policy',
      element: <VendorPolicyView defaultType="Privacy Policy" />
    },
    {
      path: 'terms-of-service',
      element: <VendorPolicyView defaultType="Terms & Conditions" />
    },
    {
      path: 'vendor-policies',
      element: <VendorPolicyView />
    },
    {
      path: 'packages',
      element: <PackagesManagement />
    },
    {
      path: 'packages/:customId/:serviceName',
      element: <PackagesManagement />
    },
    {
      path: 'bookings',
      element: <PlatformBookings />
    },
    {
      path: 'wallet',
      element: <PlatformWallet />
    },
    {
      path: 'enquiries',
      element: <WebEnquiries />
    },
    {
      path: 'contact-us',
      element: <WebContactUs />
    },
    {
      path: 'testimonials',
      element: <PlatformTestimonials />
    },
    {
      path: 'reviews',
      element: <PlatformTestimonials />
    },
    {
      path: 'platform',
      children: [
        {
          path: 'bookings',
          element: <PlatformBookings />
        },
        {
          path: 'wallet',
          element: <PlatformWallet />
        },
        {
          path: 'banners',
          element: <PlatformBanners />
        },
        {
          path: 'blogs',
          element: <PlatformBlogs />
        },
        {
          path: 'testimonials',
          element: <PlatformTestimonials />
        },
        {
          path: 'policies',
          element: <PlatformPolicies />
        },
        {
          path: 'privacy-policy',
          element: <VendorPolicyView defaultType="Privacy Policy" />
        },
        {
          path: 'terms-of-service',
          element: <VendorPolicyView defaultType="Terms & Conditions" />
        },
        {
          path: 'services',
          element: <ServicesManagement />
        },
        {
          path: 'packages',
          element: <PackagesManagement />
        },
        {
          path: 'packages/:customId/:serviceName',
          element: <PackagesManagement />
        },
        {
          path: 'vendors',
          element: <PlatformVendors />
        },
        {
          path: 'enquiries',
          element: <WebEnquiries />
        },
        {
          path: 'contact-us',
          element: <WebContactUs />
        },
        {
          path: 'api-docs',
          element: <ApiDocumentation />
        }
      ]
    },
    {
      path: 'system',
      children: [
        {
          path: 'settings',
          element: <VendorSettings />
        },
        {
          path: 'settings/profile',
          element: <VendorSettings />
        },
        {
          path: 'settings/security',
          element: <SecuritySettings />
        },
        {
          path: 'settings/notifications',
          element: <NotificationSettings />
        },
        {
          path: 'settings/subscription',
          element: <VendorSubscriptionSettings />
        },
        {
          path: 'settings/api-docs',
          element: <ApiDocumentation />
        }
      ]
    },
    {
      path: 'pages',
      children: [
        {
          path: 'error/404',
          element: <Error404 />
        },
        {
          path: 'error/500',
          element: <Error500 />
        },
        {
          path: 'error/403',
          element: <Error403 />
        },
        {
          path: 'maintenance',
          element: <MaintenancePage />
        }
      ]
    },
    {
      path: '/sample-page',
      element: <SamplePage />
    }
  ]
};

export default MainRoutes;
