import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { SERVER } from '../config/config';

const Complete = () => {
    const { user_id, theme_id } = useParams();
    const [error, setError] = useState(null);

    useEffect(() => {
        const storePurchase = async () => {
            try {
                await axios.post(`${SERVER}/stripe/storeThemePurchase`, {
                    user_id: user_id, 
                    theme_id: theme_id,
                });
                console.log("Purchase stored successfully");
            } catch (error) {
                console.error("Failed to store purchase:", error);
                setError("Failed to record your purchase. Please contact support.");
            }
        };

        storePurchase();
    }, [user_id, theme_id]); // Add user_id and theme_id as dependencies

    return (
        <div>
            <h1>Payment Complete!</h1>
            <p>Thank you for your purchase.</p>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default Complete;
