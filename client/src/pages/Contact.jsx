import { useState } from 'react';
import Layout from '../Layouts/Layout';
import '../scss/pages/Contact.scss';
import Emira from '../utils/home-banner.jpeg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import { SERVER } from '../config/config';
import axios from 'axios';

const Contact = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const sendEmail = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage(null);

        const formData = {
            name: fullName,
            email: email,
            phone: phone,
            message: message,
        };

        try {
            const response = await axios.post(`${SERVER}/contact/send-email`, formData);
            if (response.status === 200) {
                alert('Email sent successfully!');
                setFullName('');
                setEmail('');
                setPhone('');
                setMessage('');
            } else {
                setErrorMessage('Failed to send email.');
            }
        } catch (error) {
            setErrorMessage('An error occurred while sending the email.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="contact">
                <img src={Emira} alt='Emira' />
                <h1>Contactez-moi</h1>
                <span>Je suis à votre écoute...</span>
                <div className='contact-main'>
                    <div className='contact-info'>
                        <div className='contact-card'>
                            <FontAwesomeIcon icon={faPhone} size='2xl' />
                            <h2>Numéro de Téléphone</h2>
                            <span>+216 98 741 168</span>
                        </div>
                        <div className='contact-card'>
                            <FontAwesomeIcon icon={faEnvelope} size='2xl' />
                            <h2>Adresse E-Mail</h2>
                            <span> emirabakaroud@gmail.com </span>
                        </div>
                    </div>
                    <div className='contact-mail'>
                        <form onSubmit={sendEmail}>
                            <input
                                type='text'
                                placeholder='Nom Complet'
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                            <input
                                type='email'
                                placeholder='Adresse E-Mail'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <input
                                type='text'
                                placeholder='Numéro de Téléphone'
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                            <textarea
                                placeholder='Votre Message...'
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                            />
                            <button type="submit" disabled={isLoading}>
                                {isLoading ? 'Envoi en cours...' : 'Envoyer le Message'}
                            </button>
                            {errorMessage && <p className="error">{errorMessage}</p>}
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Contact;
