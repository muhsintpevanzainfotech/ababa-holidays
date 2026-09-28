import { createBrowserRouter } from 'react-router-dom';

// project imports
import AuthenticationRoutes from './AuthenticationRoutes';
import MainRoutes from './MainRoutes';
import Error404 from 'views/pages/maintenance/Error404';
import Error500 from 'views/pages/maintenance/Error500';
import Error403 from 'views/pages/maintenance/Error403';
import Maintenance from 'views/pages/maintenance/Maintenance';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter(
  [
    MainRoutes, 
    AuthenticationRoutes, 
    { path: '/pages/error/404', element: <Error404 /> },
    { path: '/pages/error/500', element: <Error500 /> },
    { path: '/pages/error/403', element: <Error403 /> },
    { path: '/pages/maintenance', element: <Maintenance /> },
    { path: '*', element: <Error404 /> }
  ], 
  {
    basename: import.meta.env.VITE_APP_BASE_NAME
  }
);

export default router;
