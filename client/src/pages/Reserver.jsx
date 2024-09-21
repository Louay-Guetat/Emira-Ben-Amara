import Layout from "../Layouts/Layout";
import React, { useRef, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list'; 
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ErrorBoundary from '../hooks/ErrorBoundary.jsx';
import { SERVER } from "../config/config.js";
import '../scss/pages/Reserver.scss'
import useUser from "../hooks/useUser.jsx";

const Reserver = () => {
    const calendarRef = useRef(null);
    const [events, setEvents] = useState([]);
    const [toastId, setToastId] = useState(null);
    const {user, loading} = useUser()

    const formatDate = (date) => new Date(date).toISOString();

    const fetchEvents = async () => {
        try {
            // Fetching appointments
            const responseAppointments = await axios.get(`${SERVER}/appointments/getAppointments`);
            let appointments = [];
    
            if (responseAppointments.status === 200) {
                const formattedAppointments = responseAppointments.data.map(event => ({
                    ...event,
                    confirmed_date: event.confirmed_date ? formatDate(event.confirmed_date) : null,
                    type: 'appointment'  // Add a type to distinguish appointments
                }));
    
                const { withDateAppointment } = formattedAppointments.reduce(
                    (acc, item) => {
                        if (item.confirmed_date) {
                            acc.withDateAppointment.push(item);
                        }
                        return acc;
                    },
                    { withDateAppointment: [] }
                );
    
                appointments = withDateAppointment;
            }
    
            // Fetching events
            const responseEvents = await axios.get(`${SERVER}/events/getEvents`);
            let events = [];
    
            if (responseEvents.status === 200) {
                events = responseEvents.data.events.map(event => ({
                    ...event,
                    type: 'event',  // Add a type to distinguish events
                }));
            }
    
            // Merging appointments and events
            const mergedData = [...appointments, ...events];
    
            // Setting merged data to state
            setEvents(mergedData);
    
        } catch (error) {
            console.log(error);
        }
    };
    
    useEffect(() => {
        fetchEvents();
    }, []);

    const handleDateClick = (info) => {
        const selectedDateStr = info.dateStr;
        const formattedDate = new Date(selectedDateStr).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false
        });
        console.log(formattedDate)

        const id = toast(<ConfirmToast time={formattedDate} onConfirm={() => confirmAppointment(formattedDate)} onCancel={cancelAppointment} />, {
            position: "top-center",
            autoClose: false,
            closeOnClick: false,
            draggable: false,
        });
        
        setToastId(id); // Store the toast ID
    };

    const confirmAppointment = async (formattedDate) => {
        if (!formattedDate) return;
    
        // Remove "at" and adjust the format
        const cleanDate = formattedDate.replace(" at ", " ");
        
        // Create a Date object from the cleaned string
        const dateObject = new Date(cleanDate);
        
        // Check if the dateObject is valid
        if (isNaN(dateObject)) {
            toast.error('Invalid date selected.');
            return;
        }
    
        // Format the date to the desired format
        const dateToSend = dateObject.toISOString().slice(0, 19).replace('T', ' ');
    
        try {
            const response = await axios.post(`${SERVER}/appointments/setAppointment`, {
                email: user.email,
                phone: user.phone,
                name: user.username,
                uid: user.id,
                desired_date: dateToSend, // Send the correctly formatted date to the server
            });
    
            if (response.status === 200) {
                toast.success('Appointment confirmed successfully!');
                fetchEvents();
            } else {
                toast.error('Failed to confirm appointment.');
            }
        } catch (error) {
            console.log(error);
            toast.error('Error confirming appointment.');
        }
    };
    

    const cancelAppointment = () => {
        toast.dismiss(toastId); // Close the confirm toast
        toast.info('Appointment not confirmed.');
    };

    const ConfirmToast = ({ time, onConfirm, onCancel }) => (
        <div>
            <p>Do you want to confirm the appointment for "{time}"?</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={onConfirm} style={{ marginRight: 10 }}>Yes</button>
                <button onClick={onCancel}>No</button>
            </div>
        </div>
    );

    return (
        <Layout>
            <ErrorBoundary>
                <DndProvider backend={HTML5Backend}>
                    <div className="reserver">
                        <ToastContainer />
                        <h1> Réserver Votre Place Dés Maintenant </h1>
                        <span> Choisissez La date Qui vous convient, Je serai Disponible.</span>
                        <div className='main'>
                            <div id="calendar-container">
                            <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                                initialView='timeGridWeek'
                                initialDate={new Date()}
                                validRange={{ start: new Date() }} // Restrict to today and future dates
                                hiddenDays={[0, 6]} // Hide Sundays (0) and Saturdays (6)
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'timeGridWeek,timeGridDay',
                                }}
                                editable={false}
                                eventResizableFromStart={false}
                                eventDurationEditable={false}
                                selectable={true}
                                droppable={false}
                                dateClick={handleDateClick}
                                events={events.map(event => ({
                                    id: event.email ? 'appoint' + event.id : 'event' + event.id,
                                    title: event.date_event ? event.name : 'Réserver',
                                    start: event.confirmed_date ? event.confirmed_date : event.date_event,
                                    backgroundColor: event.confirmed_date || event.date_event ? 'red' : 'green',
                                }))}
                                slotMinTime='08:00:00'
                                slotMaxTime='20:00:00'
                                slotLabelFormat={{ hour: 'numeric', minute: '2-digit', hour12: false }}
                            />
                            </div>
                        </div>
                    </div>
                </DndProvider>
            </ErrorBoundary>
        </Layout>
    );
};

export default Reserver;
