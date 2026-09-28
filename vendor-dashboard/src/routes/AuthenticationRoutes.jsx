import { lazy } from 'react';

// project imports
import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';
import GuestGuard from 'utils/route-guard/GuestGuard';

// maintenance routing
const LoginPage = Loadable(lazy(() => import('views/pages/authentication/Login')));
const RegisterPage = Loadable(lazy(() => import('views/pages/authentication/Register')));
const ForgotPasswordPage = Loadable(lazy(() => import('views/pages/authentication/ForgotPassword')));

// ==============================|| AUTHENTICATION ROUTING ||============================== //

const AuthenticationRoutes = {
  path: '/',
  element: (
    <GuestGuard>
      <MinimalLayout />
    </GuestGuard>
  ),
  children: [
    {
      path: '/login',
      element: <LoginPage />
    },
    {
      path: '/pages/login',
      element: <LoginPage />
    },
    {
      path: '/register',
      element: <RegisterPage />
    },
    {
      path: '/pages/register',
      element: <RegisterPage />
    },
    {
      path: '/forgot-password',
      element: <ForgotPasswordPage />
    },
    {
      path: '/pages/forgot-password',
      element: <ForgotPasswordPage />
    }
  ]
};

export default AuthenticationRoutes;
