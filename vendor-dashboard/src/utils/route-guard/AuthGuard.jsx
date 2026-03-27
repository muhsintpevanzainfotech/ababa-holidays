import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// ==============================|| AUTH GUARD ||============================== //

/**
 * Authentication guard to check if use is logged in.
 * If not logged in, redirects to login page.
 */
const AuthGuard = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/pages/login', { replace: true });
    }
  }, [token, navigate]);

  return children;
};

AuthGuard.propTypes = {
  children: PropTypes.node
};

export default AuthGuard;
