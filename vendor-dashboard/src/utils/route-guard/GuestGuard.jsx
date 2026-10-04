import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { isTokenExpired } from 'utils/jwt';
import { logout } from 'store/slices/authSlice';

// ==============================|| GUEST GUARD ||============================== //

/**
 * Guest guard to check if user is already logged in.
 * If logged in with valid token, redirects to dashboard.
 */
const GuestGuard = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (token) {
      if (isTokenExpired(token)) {
        dispatch(logout());
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [token, navigate, dispatch]);

  return children;
};

GuestGuard.propTypes = {
  children: PropTypes.node
};

export default GuestGuard;

