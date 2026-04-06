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

const VendorSettings = Loadable(lazy(() => import('views/pages/settings')));

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
      path: 'analytics',
      element: <DashboardAnalytics />
    },
    {
      path: 'reports',
      element: <DashboardReports />
    },
    {
      path: 'platform',
      children: [
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
          path: 'services',
          element: <ServicesManagement />
        }
      ]
    },
    {
      path: 'system',
      children: [
        {
          path: 'settings',
          element: <VendorSettings />
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
