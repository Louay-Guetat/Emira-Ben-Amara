import { useParams } from 'react-router-dom';
import axios from 'axios';
import { SERVER } from '../config/config';
import { useState, useEffect } from 'react';
import Layout from '../Layouts/Layout';
import '../scss/success.scss'

const BookPurchaseSuccess = () => {
    const { user_id, book_id } = useParams();
    const [error, setError] = useState(null);
    let purchased = false
    console.log(user_id, book_id)
    useEffect(() => {
        const storePurchase = async () => {
            purchased = true
            try {
                await axios.post(`${SERVER}/stripe/storeBookPurchase`, {
                    user_id,
                    book_id
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
                    <p>Merci pour votre confiance.</p>
                    <p> Visitez votre Profile pour visualizer le Livre </p>
                    <a href='/profile'> Profile </a>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </div>
            </div>
        </Layout>
    );
};

export default BookPurchaseSuccess;
