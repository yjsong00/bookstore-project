
  //..hooks/useAuth.tsx

  import { useState, useEffect } from 'react';
  import { initializeCognitoConfig, loginUser, logoutUser } from '../utils/auth';
  import { getTokens, getUserInfo, UserInfo, clearAllTokens } from '../utils/tokenManager';
    
  export const useAuth = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    useEffect(() => {
      initializeCognitoConfig();
      checkLoginStatus();
    }, []);

    const checkLoginStatus = () => {
      const storedUserInfo = getUserInfo();
      if (storedUserInfo) {
        const tokens = getTokens(storedUserInfo.username);
        if (tokens) {
          setIsLoggedIn(true);
          setUserInfo(storedUserInfo);
        } else {
          // Tokens not found for stored user, consider them logged out
          clearAllTokens();
        }
      }
    };

    const login = async (username: string, password: string) => {

      try {
        await loginUser(username, password);
        const updatedUserInfo = getUserInfo();
        if (updatedUserInfo) {
          setIsLoggedIn(true);
          setUserInfo(updatedUserInfo);
        } else {
          throw new Error('User info not found after login');
        }
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    };

    const logout = () => {
      logoutUser();
      setIsLoggedIn(false);
      setUserInfo(null);
      
    };

    return { isLoggedIn, userInfo, login, logout };
  };