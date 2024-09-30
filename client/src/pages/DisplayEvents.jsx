import { useEffect, useState } from "react";
import Layout from "../Layouts/Layout";
import axios from "axios";
import { SERVER } from "../config/config";
import '../scss/pages/DisplayEvents.scss';
import eventImage from '../utils/1.jpeg';
import { useNavigate } from "react-router-dom";
import useUser from "../hooks/useUser";
import { loadStripe } from '@stripe/stripe-js';
import { faCcStripe } from '@fortawesome/free-brands-svg-icons'; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from '@mui/material'; // Ensure you have MUI installed

const DisplayEvents = () => {
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();
    const {user, loading} = useUser()
    const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
    const [paymentModal, setPaymentModal] = useState(false); // State for payment modal
    const [ownedEvents, setOwnedEvents] = useState()

    useEffect(() => {   
        const fetchEvents = async () => {
            try {
                const response = await axios.get(`${SERVER}/events/getEvents`);
                if (response.status === 200) {
                    setEvents(response.data.events);
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchEvents();
    }, []);

    useEffect(() =>{
        const fetchOwnedEvents = async () =>{
            try{
                const response = await axios.get(`${SERVER}/stripe/getOwnedEvents`, {
                    params : {
                        user_id : user.id
                    }
                })

                if (response.status === 200){
                    setOwnedEvents(response.data.events)
                }
            }catch(err){
                console.log(err)
            }
        }
        fetchOwnedEvents()
    }, [user])

    const calculateTimeLeft = (date_event) => {
        const eventDate = new Date(date_event);
        const now = new Date();
        const difference = eventDate - now;

        if (difference > 0) {
            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        } else {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
    };

    const [timeLeft, setTimeLeft] = useState(() => {
        return events.map(event => calculateTimeLeft(event.date_event));
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(events.map(event => calculateTimeLeft(event.date_event)));
        }, 1000);

        return () => clearInterval(timer);
    }, [events]);

    const BuyEventSetter = () => {
        setPaymentModal(true); // Open the payment modal
    };

    const handlePaymentClose = () => {
        setPaymentModal(false); // Close the modal
    };

    const BuyEvent = async (evenement) =>{
        try {
            const response = await axios.post(`${SERVER}/stripe/buyEvent`, {
                event: {
                    name: evenement.name,
                    price: evenement.price,
                    id: evenement.id,
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
    }

    return (
        <Layout>
            <div className="DisplayEvents">
                <div className="div-wallpaper"></div>
                <div className="events-clients">
                    {events.length > 0 ? (
                        <div className="events">
                            {events.map((evenement, index) => {
                                const isCountdownFinished =
                                    timeLeft[index]?.days === 0 &&
                                    timeLeft[index]?.hours === 0 &&
                                    timeLeft[index]?.minutes === 0 &&
                                    timeLeft[index]?.seconds === 0;
                                
                                const isOwned = ownedEvents?.some((ownedEvent) => ownedEvent.id === evenement.id);

                                return (
                                    <div
                                        key={index}
                                        className="event"
                                        style={{
                                            backgroundImage: `url(${evenement.image ? evenement.image : eventImage})`,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: 'cover',
                                        }}
                                    >
                                    {
                                        timeLeft[index]?.days !== undefined && timeLeft[index]?.hours !== undefined && timeLeft[index]?.minutes !== undefined && timeLeft[index]?.seconds !== undefined ? (
                                            <div className="countdown">
                                                {!isCountdownFinished ? (
                                                    `${timeLeft[index]?.days}d ${timeLeft[index]?.hours}h ${timeLeft[index]?.minutes}m ${timeLeft[index]?.seconds}s`
                                                ) : (
                                                    'Welcome'
                                                )}
                                            </div>
                                        ) : (
                                            <div></div>
                                        )
                                    }
                                    
                                    <h1>{evenement.name}</h1>
                                    <span>{evenement.description}</span>
                                    {!isOwned && evenement.price !== 0 ? (
                                        <div className="pay-event">
                                            <span> Prix de L'événement <br /> {evenement.price} € </span>
                                            <button onClick={BuyEventSetter}> Payer </button>
                                        </div>
                                    ) : (
                                        evenement.price === 0 && (
                                            <div className="pay-event">
                                                <span> L'événement est <u>gratuit</u> <br /> soyez le Bienvenus. </span>
                                            </div>
                                        )
                                    )}
                                    <div className="participate-event">
                                        <button onClick={() => navigate(`/visioconference/${evenement.event_link}`)} disabled={!isCountdownFinished}>
                                            Participer
                                        </button>
                                    </div>
                                    <Dialog open={paymentModal} onClose={handlePaymentClose}>
                                        <DialogTitle>Choose Payment Option</DialogTitle>
                                        <DialogContent>
                                            <Typography>How would you like to proceed with payment?</Typography>
                                        </DialogContent>
                                        <DialogActions style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '50px' }}>
                                            <Button color="primary" variant="contained" onClick={() => BuyEvent(evenement)}>
                                                <FontAwesomeIcon icon={faCcStripe} size="2xl" />
                                            </Button>
                                            <Button 
                                                color="primary" 
                                                variant="contained" 
                                                onClick={() => {
                                                    const message = `I want to pay via bank transfer for the event: ${evenement.name}.`;
                                                    window.open(`https://wa.me/+21655160398?text=${encodeURIComponent(message)}`, '_blank');
                                                }}
                                            >
                                                <WhatsAppIcon style={{ fontSize: 28 }} />
                                            </Button>
                                        </DialogActions>
                                    </Dialog>
                                </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="events-not-found">No event found</div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default DisplayEvents;
