import { useState, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import globalContext from '../context/global/globalContext';
import setAuthToken from '../helpers/setAuthToken';
import config from '../clientConfig';

const getApiUrl = (path) => {
  const base = config.apiBaseUrl || '';
  return base ? `${base.replace(/\/$/, '')}/${path}` : `/${path}`;
};

/**
 * Custom hook for authentication operations
 * Provides login, register, and logout functionality
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const { setUserName, setEmail, setId, setWalletAddress } = useContext(globalContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handle successful authentication
   */
  const handleAuthSuccess = useCallback((token, user) => {
    // Store token
    localStorage.setItem('token', token);
    setAuthToken(token);

    // Update global state
    setUserName(user.name);
    setEmail(user.email);
    setId(user.id);
    setWalletAddress(user.email || user.name);

    setError(null);
  }, [setUserName, setEmail, setId, setWalletAddress]);

  /**
   * Login user
   */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(getApiUrl('api/auth'), {
        email,
        password,
      });

      const { token } = res.data;
      setAuthToken(token);

      // Get user data
      const userRes = await axios.get(getApiUrl('api/auth'), {
        headers: {
          'x-auth-token': token,
        },
      });

      handleAuthSuccess(token, userRes.data);

      // Persist for Play page in case context hasn't updated yet
      const userEmail = userRes.data?.email || userRes.data?.name;
      if (userEmail) {
        localStorage.setItem('playWalletAddress', userEmail);
      }

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'You have been logged in successfully.',
        timer: 2000,
        showConfirmButton: false,
      });

      navigate('/play', { state: { walletAddress: userEmail } });
      return { success: true };
    } catch (err) {
      // Handle different error response formats
      const errorMsg = err.response?.data?.errors?.[0]?.msg 
        || err.response?.data?.message
        || err.response?.data?.msg 
        || err.message
        || 'Login failed. Please try again.';
      
      setError(errorMsg);
      
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: errorMsg,
      });

      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [navigate, handleAuthSuccess]);

  /**
   * Register new user
   */
  const register = useCallback(async (name, email, password, password2) => {
    if (password !== password2) {
      const errorMsg = 'Passwords do not match';
      setError(errorMsg);
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: errorMsg,
      });
      return { success: false, error: errorMsg };
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(getApiUrl('api/users'), {
        name,
        email,
        password,
      });

      const { token } = res.data;
      setAuthToken(token);

      // Get user data
      const userRes = await axios.get(getApiUrl('api/auth'), {
        headers: {
          'x-auth-token': token,
        },
      });

      handleAuthSuccess(token, userRes.data);

      const userEmail = userRes.data?.email || userRes.data?.name;
      if (userEmail) {
        localStorage.setItem('playWalletAddress', userEmail);
      }

      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Your account has been created successfully.',
        timer: 2000,
        showConfirmButton: false,
      });

      navigate('/play', { state: { walletAddress: userEmail } });
      return { success: true };
    } catch (err) {
      // Handle different error response formats
      const errorMsg = err.response?.data?.errors?.[0]?.msg 
        || err.response?.data?.message
        || err.response?.data?.msg 
        || err.message
        || 'Registration failed. Please try again.';
      
      setError(errorMsg);
      
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: errorMsg,
      });

      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [navigate, handleAuthSuccess]);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUserName(null);
    setEmail(null);
    setId(null);
    setWalletAddress('');
    navigate('/');
  }, [navigate, setUserName, setEmail, setId, setWalletAddress]);

  return {
    login,
    register,
    logout,
    loading,
    error,
  };
};
