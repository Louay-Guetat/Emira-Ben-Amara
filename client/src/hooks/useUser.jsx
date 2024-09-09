
import { useState, useEffect } from 'react';
import { getUserInfo } from '../config/auth';
import Cookies from 'js-cookie';

const useUser = () => {
  const token = Cookies.get('token')
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserInfo();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user data');
        // Optionally handle error state here
      } finally {
        setLoading(false);
      }
    };

    if (token){
      fetchUser();
    }
        
  }, []);

  return { user, loading };
};

export default useUser;
