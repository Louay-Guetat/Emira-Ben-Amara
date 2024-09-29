import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { SERVER } from '../config/config';
import '../scss/success.scss'
import Layout from '../Layouts/Layout';

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
    }, [user_id, theme_id]);

    return (
        <Layout>
            <div className='payment-success'>
                <div className="div-wallpaper"></div>
                <div className="success-message">
                    <h1>Paiement fait avec success!</h1>
                    <p>Merci pour votre confiance.</p>
                    <p> Vous pouvez accéder au ressources dans votre Profile.</p>
                    <a href='/profile'> Profile </a>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </div>
            </div>
        </Layout>
    );
};

export default Complete;
