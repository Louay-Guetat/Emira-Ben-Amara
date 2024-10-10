import { useEffect, useState } from 'react';
import '../scss/pages/ThemeParts.scss';
import axios from 'axios';
import { SERVER } from '../config/config';
import Module from './Module';
import Cours from './Cours';
import { loadStripe } from '@stripe/stripe-js';
import useUser from '../hooks/useUser';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCcStripe } from '@fortawesome/free-brands-svg-icons'; 
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from '@mui/material'; // Ensure you have MUI installed

const ThemeParts = ({ theme }) => {
    const { user, loading } = useUser();
    const [themeParts, setThemeParts] = useState([]);
    const [themePart, setThemePart] = useState();
    const [cours, setCourses] = useState();
    const [owned, setOwned] = useState(false);
    const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
    const [animateBuyButton, setAnimateBuyButton] = useState(false); // State for animation
    const [paymentModal, setPaymentModal] = useState(false); // State for payment modal

    useEffect(() => {
        const fetchThemeParts = async () => {
            try {
                const themeID = theme.id;
                console.log(themeID);
                const response = await axios.get(`${SERVER}/themeParts/getThemeParts`, {
                    params: { themeID },
                });

                if (response.status === 200) {
                    setThemeParts(response.data.themeParts);
                }
            } catch (err) {
                console.log(err);
            }
        };

        const fetchThemeOwned = async () => {
            try {
                const response = await axios.get(`${SERVER}/stripe/getThemeOwned`, {
                    params: {
                        theme_id: theme.id,
                        user_id: user.id,
                    },
                });

                if (response.status === 200) {
                    setOwned(response.data.owned);
                }
            } catch (err) {
                console.log(err);
            }
        };

        if (theme && user) {
            fetchThemeParts();
            fetchThemeOwned();
        }
    }, [theme, user]);

    const buyThemeParts = () => {
        setPaymentModal(true);
    };

    const payWithStripe = async () => {
        try {
            const response = await axios.post(`${SERVER}/stripe/checkout`, {
                theme: {
                    name: theme.title,
                    price: theme.price,
                    id: theme.id,
                },
                user_id: user.id, 
            });
            const { sessionId } = response.data;

            const stripe = await stripePromise;
            const { error } = await stripe.redirectToCheckout({ sessionId });

            if (error) {
                console.error('Error during checkout:', error);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setPaymentModal(false);
        }
    };

    const handleThemePartClick = (themePart, index) => {
        if (owned || index === 0) {
            setThemePart(themePart);
        } else {
            setAnimateBuyButton(true);
            setTimeout(() => setAnimateBuyButton(false), 1000);
        }
    };

    const handlePaymentClose = () => {
        setPaymentModal(false);
    };

    return (
        <>
            {themePart ? (
                <Module theme={theme} themePart={themePart} />
            ) : cours ? (
                <Cours />
            ) : (
                <div className="themePartsDetails">
                    <button id='go-back-courses' onClick={() => setCourses(theme)}>
                        <FontAwesomeIcon icon={faCaretLeft} color='white' />
                    </button>
                    <h1>{theme.title}</h1>
                    <div className='parts'>
                        <img src={theme.image} alt={theme.title} />
                        <div className='parts-details'>
                            <span>{theme.description}</span>
                            <ol>
                                {themeParts.length > 0 &&
                                    themeParts.map((themePart, index) => (
                                        <li key={themePart.id} onClick={() => handleThemePartClick(themePart, index)}>
                                            {themePart.title}
                                        </li>
                                    ))}
                            </ol>
                        </div>
                    </div>
                    {owned === false ? (
                        <button
                            onClick={buyThemeParts}
                            className={animateBuyButton ? 'animate' : ''}
                        >
                            Acheter maintenant 
                        </button>
                    ) : null}
                </div>
            )}
            <Dialog open={paymentModal} onClose={handlePaymentClose}>
                <DialogTitle>Choose Payment Option</DialogTitle>
                <DialogContent>
                    <Typography>How would you like to proceed with payment?</Typography>
                </DialogContent>
                <DialogActions style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '50px' }}>
                    <Button color="primary" variant="contained" onClick={payWithStripe}>
                        <FontAwesomeIcon icon={faCcStripe} size="2xl" />
                    </Button>
                    <Button 
                        color="primary" 
                        variant="contained" 
                        onClick={() => {
                            const message = `I want to pay via bank transfer for the product: ${theme.title}.`;
                            window.open(`https://wa.me/+21655160398?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                    >
                        <WhatsAppIcon style={{ fontSize: 28 }} />
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ThemeParts;
