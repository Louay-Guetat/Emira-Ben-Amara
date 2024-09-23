import { useParams } from 'react-router-dom';
import axios from 'axios';
import { SERVER } from '../config/config';
import { useState, useEffect } from 'react';

const AppointmentPurchaseSuccess = () => {
    const { user_id, start, end } = useParams();
    const [error, setError] = useState(null);
    let purchased = false

    useEffect(() => {
        const storePurchase = async () => {
            purchased = true
            try {
                await axios.post(`${SERVER}/stripe/storeAppointmentPurchase`, {
                    user_id,
                    start,
                    end
                });
                console.log("Purchase stored successfully");
            } catch (error) {
                console.error("Failed to store purchase:", error);
                setError("Failed to record your purchase. Please contact support.");
            }
        };

        // Only call storePurchase if the necessary parameters are present
        if (!purchased) {
            storePurchase();
        }
    }, [1]); // Dependencies array to re-run the effect when params change

    return (
        <div>
            <h1>Payment Complete!</h1>
            <p>Thank you for your purchase.</p>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default AppointmentPurchaseSuccess;
