import { useEffect, useState } from "react";
import Layout from "../Layouts/Layout";
import axios from "axios";
import { SERVER } from "../config/config";
import '../scss/pages/DisplayEvents.scss';
import eventImage from '../utils/1.jpeg';

const DisplayEvents = () => {
    const [events, setEvents] = useState([]);

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
                                        <div className="countdown">
                                            {!isCountdownFinished ? (
                                                `${timeLeft[index]?.days}d ${timeLeft[index]?.hours}h ${timeLeft[index]?.minutes}m ${timeLeft[index]?.seconds}s`
                                            ) : (
                                                'Welcome'
                                            )}
                                        </div>
                                        <h1>{evenement.name}</h1>
                                        <span>{evenement.description}</span>
                                        <div className="pay-event"> 
                                            <span> Prix de L'événement </span>
                                            <button> Payer </button>
                                        </div>
                                        <div className="participate-event">
                                            <button disabled={!isCountdownFinished}>
                                                Participer
                                            </button>
                                        </div>
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
