import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// ==============================|| GUEST GUARD ||============================== //

/**
 * Guest guard to check if use is already logged in.
 * If logged in, redirects to dashboard.
 */
const GuestGuard = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  return children;
};

GuestGuard.propTypes = {
  children: PropTypes.node
};

export default GuestGuard;
