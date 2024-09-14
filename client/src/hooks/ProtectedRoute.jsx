import React from 'react';
import { Navigate } from 'react-router-dom';
import useUser from './useUser';

const ProtectedRoute = ({ element: Component, ...rest }) => {
    const {user} = useUser(); 
    if (user){
        return user && user.role === 'admin' ? (
            <Component {...rest} />
        ) : (
            <Navigate to="/" />
        );
    }
    
};

export default ProtectedRoute;
