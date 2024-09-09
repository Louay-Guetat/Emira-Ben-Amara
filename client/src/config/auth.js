// src/api/userApi.js

import axios from 'axios';
import { SERVER } from './config';

const API_URL = `${SERVER}/auth/user`; 
export const getUserInfo = async () => {
    try {
      const response = await axios.get(API_URL, {
        withCredentials: true, // This ensures cookies are sent with the request
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  };
