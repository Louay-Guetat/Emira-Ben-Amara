import Layout from "../Layouts/Layout";
import React, { useRef, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ErrorBoundary from '../hooks/ErrorBoundary.jsx';
import { SERVER } from "../config/config.js";
import '../scss/pages/Reserver.scss';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';
import useUser from "../hooks/useUser.jsx";
import { loadStripe } from '@stripe/stripe-js';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCcStripe } from '@fortawesome/free-brands-svg-icons';
import { useNavigate } from "react-router-dom";
import frLocale from '@fullcalendar/core/locales/fr';

const Reserver = () => {
    const {user, loading} = useUser()
    const navigate = useNavigate()
    const calendarRef = useRef(null);
    const [availability, setAvailability] = useState([]);
    const [appointements, setAppointements] = useState([]);
    const [events, setEvents] = useState([])
    const [openModal, setOpenModal] = useState(false);
    const [paymentModal, setPaymentModal] = useState(false);
    const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
    const [selectedTime, setSelectedTime] = useState({
        start: '',
        end: '',
    });

    // Fetch availability data when the component mounts
    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const response = await axios.get(`${SERVER}/appointments/getAvailability`);
                if (response.status === 200) {
                    setAvailability(response.data.dispo);
                    console.log(response.data.dispo);
                }
            } catch (err) {
                console.log(err);
            }
        };

        const fetchEvents = async () => {
            try {
                const response = await axios.get(`${SERVER}/events/getEvents`);
                if (response.status === 200) {
                    const formattedEvents = response.data.events.map(event => {
                        // If the event has only a date and no specific time, format it as an all-day event.
                        if (event.date_event) {
                            return {
                                ...event,
                                title: event.name,
                                start: event.date_event,
                                end: event.date_event,
                                backgroundColor: 'orange',
                            };
                        } else {
                            return event;
                        }
                    });
                    setEvents(formattedEvents);
                }
            } catch (error) {
                console.log(error);
            }
        };

        const fetchApp = async () => {
            try {
                const response = await axios.get(`${SERVER}/appointments/getAppointments`);
                if (response.status === 200) {
                    const formattedAppoinements = response.data.map(event => ({
                        ...event,
                    }));

                    setAppointements(formattedAppoinements);
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchAvailability();
        fetchApp();
        fetchEvents();
    }, []);

    const formatLocalDateTime24H = (date) => {
        const tzOffset = date.getTimezoneOffset() * 60000; // Offset in milliseconds
        const localISOTime = new Date(date - tzOffset).toISOString().slice(0, 16);
        return localISOTime;
    };    

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0'); // Get day and pad with zero if needed
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0'); // Get hours and pad with zero if needed
        const minutes = String(date.getMinutes()).padStart(2, '0'); // Get minutes and pad with zero if needed
    
        return `${day}/${month}/${year} à ${hours}:${minutes}`;
    };    

    const handleDateSelect = (info) => {
        const { date } = info;
    
        // Automatically set the end time to 1 hour and 15 minutes from the clicked time
        const end = new Date(date.getTime() + 75 * 60 * 1000); // 1 hour 15 minutes = 75 minutes
    
        // Check if the clicked time falls within available slots
        const isAvailable = availabilitySegments.some(slot => {
            const slotStart = new Date(slot.start);
            const slotEnd = new Date(slot.end);
            return (date >= slotStart && end <= slotEnd);
        });
    
        if (isAvailable) {
            setSelectedTime({
                start: formatLocalDateTime24H(date),  // Local time formatting for the start in 24-hour format
                end: formatLocalDateTime24H(end),    // Local time formatting for the end in 24-hour format
            });
    
            setOpenModal(true);  // Open the modal to confirm the clicked time range
        } else {
            toast.error("La date sélectionnée n'est pas dans les plages disponibles.", {autoClose: 2000});
        }
    };    

    const handlePaymentClose = () => {
        setPaymentModal(false);
        calendarRef.current.getApi().unselect();
    };

    const handleClose = () => {
        setOpenModal(false);
        calendarRef.current.getApi().unselect();
    };

    const payWithStripe = async () =>{
        try {
            const formattedStartTime = new Date(selectedTime.start).toLocaleString();
            const formattedEndTime = new Date(selectedTime.end).toLocaleString();
            const response = await axios.post(`${SERVER}/stripe/appointmentCheckout`, {
                user,
                start: formattedStartTime,
                end: formattedEndTime
            });
            const { sessionId } = response.data;
    
            const stripe = await stripePromise;
            const { error } = await stripe.redirectToCheckout({ sessionId });
    
            if (error) {
                console.error('Error during checkout:', error);
            }
        } catch (error) {
            console.log(error);
        }
    }

    // Helper function to create availability segments
    const createAvailabilitySegments = (availability, appointments) => {
        const segments = [];
    
        // Iterate over each availability
        availability.forEach(avail => {
            let availStart = new Date(avail.start_date);
            let availEnd = new Date(avail.end_date);
    
            // Iterate over each appointment
            appointments.forEach(appointment => {
                let appStart = new Date(appointment.start_date);
                let appEnd = new Date(appointment.end_date);
    
                // Check if the appointment overlaps with the availability
                if (appStart < availEnd && appEnd > availStart) {
                    // If there's time before the appointment, create an availability segment
                    if (availStart < appStart) {
                        segments.push({
                            id: `avail-${avail.id}-before-${appointment.id}`,
                            title: 'Available',
                            start: availStart.toISOString(),
                            end: appStart.toISOString(),
                            backgroundColor: 'green',
                            overlap: false,
                            display: 'background',
                            color: 'green',
                            editable: false,
                        });
                    }
                    
                    // Create a segment for the appointment itself in red
                    segments.push({
                        id: `appointment-${appointment.id}`,
                        title: 'Réserver',
                        start: appStart.toISOString(),
                        end: appEnd.toISOString(),
                        backgroundColor: 'orange',
                        overlap: true,
                        display: 'background',
                        textColor: 'black',
                        editable: false,
                    });
    
                    // Update the availability start time to the end of the appointment
                    if (availEnd > appEnd) {
                        availStart = appEnd; // Continue from the end of the appointment
                    } else {
                        availStart = availEnd; // No availability left
                    }
                }
            });
    
            // If there's remaining availability after the last appointment
            if (availStart < availEnd) {
                segments.push({
                    id: `avail-${avail.id}-after`,
                    title: 'Available',
                    start: availStart.toISOString(),
                    end: availEnd.toISOString(),
                    backgroundColor: 'green',
                    overlap: false,
                    display: 'background',
                    color: 'green',
                    editable: false,
                });
            }
        });
    
        return segments;
    };
    
    const handleEventClick = (info) => {
        if (info.event.extendedProps.type === 'formattedEvent') {
            navigate('/events')
        }
    };

    const formattedEvents = events.map(event => ({
        id: event.id,
        title: 'Evénement: ' + event.title,
        start: event.start,
        end: event.end,
        allDay: event.allDay || false,
        backgroundColor: event.backgroundColor || 'blue',
        type: 'formattedEvent', // Add a custom property to identify these events
    }));        

    // Transform availability events into segments
    const availabilitySegments = [...createAvailabilitySegments(availability, appointements), ...formattedEvents];

    return (
        <Layout>
            <ErrorBoundary>
                <DndProvider backend={HTML5Backend}>
                    <div className="reserver">
                        <ToastContainer />
                        <h1>Réserver Votre Place Dès Maintenant</h1>
                        <span>Choisissez La date Qui vous convient, Je serai Disponible.</span>
                        <div className="calendar-container">
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialDate={new Date()}
                            validRange={{ start: new Date() }}
                            hiddenDays={[0, 6]}  
                            initialView="timeGridWeek"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'timeGridWeek,timeGridDay'
                            }}
                            locale={frLocale}
                            selectable={false}
                            events={availabilitySegments}
                            slotMinTime='08:00:00'
                            slotMaxTime='19:00:00'
                            allDaySlot={false}
                            dateClick={handleDateSelect}
                            slotDuration="00:30:00"
                            selectMinDistance={75}
                            slotLabelFormat={{ hour: 'numeric', minute: '2-digit', hour12: false }}
                        />
                        </div>
                        {/* Modal for confirming time */}
                        <Dialog open={openModal} onClose={handleClose}>
                            <DialogTitle>Confirmer la Réservation</DialogTitle>
                            <DialogContent>
                                <TextField
                                    label="Heure de Début"
                                    type="text"
                                    name="start"
                                    value={formatDateTime(selectedTime.start)}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    style={{ marginTop: 20 }}
                                    disabled
                                />
                                <TextField
                                    label="Heure de Fin"
                                    type="text"
                                    name="end"
                                    value={formatDateTime(selectedTime.end)}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    style={{ marginTop: 20 }}
                                    disabled
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClose}>Annuler</Button>
                                <Button 
                                    onClick={() => {
                                        setOpenModal(false);
                                        setPaymentModal(true);
                                    }} 
                                    color="primary" 
                                    variant="contained"
                                >
                                    Confirmer
                                </Button>
                            </DialogActions>
                        </Dialog>
                        {/* Payment options modal */}
                        <Dialog open={paymentModal} onClose={handlePaymentClose}>
                            <DialogTitle>Choose Payment Option</DialogTitle>
                            <DialogContent>
                                <Typography>How would you like to proceed with payment?</Typography>
                            </DialogContent>
                            <DialogActions style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'50px'}}>
                                <Button 
                                    color="primary" 
                                    variant="contained" 
                                    onClick={() => payWithStripe()}>
                                    <FontAwesomeIcon icon={faCcStripe} size="2xl" />
                                </Button>
                                <Button 
                                    color="primary" 
                                    variant="contained" 
                                    onClick={() => {
                                        const formattedStartTime = new Date(selectedTime.start).toLocaleString();
                                        const formattedEndTime = new Date(selectedTime.end).toLocaleString();
                                        const message = `I want to pay via bank transfer for an appointment at the date and time I chose: ${formattedStartTime} to ${formattedEndTime}.`;
                                        window.open(`https://wa.me/+21655160398?text=${encodeURIComponent(message)}`, '_blank');
                                    }}>
                                    <WhatsAppIcon style={{ fontSize: 28 }} />
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </div>
                </DndProvider>
            </ErrorBoundary>
        </Layout>
    );
};

export default Reserver;
