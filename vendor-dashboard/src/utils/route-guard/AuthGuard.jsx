import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { isTokenExpired } from 'utils/jwt';
import { logout } from 'store/slices/authSlice';

// ==============================|| AUTH GUARD ||============================== //

/**
 * Authentication guard to check if user is logged in.
 * If not logged in or token is expired, redirects to login page.
 */
const AuthGuard = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token || isTokenExpired(token)) {
      dispatch(logout());
      navigate('/login', { replace: true });
    }
  }, [token, navigate, dispatch]);

  return children;
};

AuthGuard.propTypes = {
  children: PropTypes.node
};

export default AuthGuard;

