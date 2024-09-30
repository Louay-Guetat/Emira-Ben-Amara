import { useParams } from 'react-router-dom';
import axios from 'axios';
import { SERVER } from '../config/config';
import { useState, useEffect } from 'react';
import '../scss/success.scss'
import Layout from '../Layouts/Layout';

const EventPurchase = () => {
    const { user_id, event_id } = useParams();
    const [error, setError] = useState(null);
    let purchased = false

    useEffect(() => {
        const storePurchase = async () => {
            purchased = true
            try {
                await axios.post(`${SERVER}/stripe/storeEventPurchase`, {
                    user_id,
                    event_id
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
        <Layout>
            <div className='payment-success'>
                <div className="div-wallpaper"></div>
                <div className="success-message">
                    <h1>Paiement fait avec success!</h1>
                    <p>Merci Pour votre confiance.</p>
                    <p>Soyez à l'heure de l'événement, j'ai hâte de vous accueillir.</p>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </div>
            </div>
        </Layout>
    );
};

export default EventPurchase;
