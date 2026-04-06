import { createBrowserRouter } from 'react-router-dom';

// project imports
import AuthenticationRoutes from './AuthenticationRoutes';
import MainRoutes from './MainRoutes';
import Error404 from 'views/pages/maintenance/Error404';

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter([MainRoutes, AuthenticationRoutes, { path: '*', element: <Error404 /> }], {
  basename: import.meta.env.VITE_APP_BASE_NAME
});

export default router;
