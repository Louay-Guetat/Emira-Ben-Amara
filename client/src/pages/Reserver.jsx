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
import { faCcStripe } from '@fortawesome/free-brands-svg-icons';  // Import Stripe icon

const Reserver = () => {
    const {user, loading} = useUser()
    const calendarRef = useRef(null);
    const [availability, setAvailability] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [paymentModal, setPaymentModal] = useState(false);
    const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
    const [selectedTime, setSelectedTime] = useState({
        start: '',
        end: '',
    });

    // Fetch availability data when the component mounts
    useEffect(() => {
        axios.get(`${SERVER}/appointments/getAvailability`)
            .then(response => {
                const availableSlots = response.data.dispo.map(slot => ({
                    title: "Disponible",
                    start: slot.start_date,
                    end: slot.end_date,
                    display: 'background',
                    color: 'green',
                    editable: false,
                }));
                setAvailability(availableSlots);
            })
            .catch(error => {
                toast.error("Erreur lors du chargement des disponibilités");
            });
    }, []);

    const handleDateSelect = (selectInfo) => {
        const { start, end } = selectInfo;

        // Check if selected time overlaps with any available slots
        const isAvailable = availability.some(slot => {
            const slotStart = new Date(slot.start);
            const slotEnd = new Date(slot.end);
            return (start >= slotStart && end <= slotEnd);
        });

        if (isAvailable) {
            setSelectedTime({
                start: start.toISOString().slice(0, 16),  // Format for datetime-local input
                end: end.toISOString().slice(0, 16),
            });
            setOpenModal(true);  // Open the modal to confirm or adjust times
            toast.success(`Date sélectionnée: ${start.toLocaleString()} - ${end.toLocaleString()}`);
        } else {
            toast.error("La date sélectionnée n'est pas dans les plages disponibles.");
        }
    };

    const handleSave = () => {
        const start = new Date(selectedTime.start);
        const end = new Date(selectedTime.end);
        console.log("Saving appointment:", start, end);

        // Close time adjustment modal and open payment modal
        setOpenModal(false);
        setPaymentModal(true);  // Show payment options modal
    };

    const handlePaymentClose = () => {
        setPaymentModal(false);
        calendarRef.current.getApi().unselect();
    };

    const handleClose = () => {
        setOpenModal(false);
        calendarRef.current.getApi().unselect();
    };

    const handleChange = (e) => {
        setSelectedTime({
            ...selectedTime,
            [e.target.name]: e.target.value,
        });
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
                                selectable={true}
                                events={availability}
                                select={handleDateSelect}
                                slotMinTime='08:00:00'
                                slotMaxTime='20:00:00'
                                allDaySlot={false}
                                slotLabelFormat={{ hour: 'numeric', minute: '2-digit', hour12: false }}
                            />
                        </div>
                        {/* Modal for adjusting time */}
                        <Dialog open={openModal} onClose={handleClose}>
                            <DialogTitle>Adjust Time Range</DialogTitle>
                            <DialogContent>
                                <TextField
                                    label="Start Time"
                                    type="datetime-local"
                                    name="start"
                                    value={selectedTime.start}
                                    onChange={handleChange}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    label="End Time"
                                    type="datetime-local"
                                    name="end"
                                    value={selectedTime.end}
                                    onChange={handleChange}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    style={{ marginTop: 20 }}
                                />
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleClose}>Cancel</Button>
                                <Button onClick={handleSave} color="primary" variant="contained">Save</Button>
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
