import AdminLayout from "../../Layouts/AdminLayout";
import React, { useRef, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list'; 
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { SERVER } from "../../config/config";
import ErrorBoundary from '../../hooks/ErrorBoundary.jsx';
import '../../scss/pages/admin/Agenda.scss'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import dayjs from 'dayjs';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'; // Optional: Add Tippy.js styles

const Agenda = () => {
    const calendarRef = useRef(null);
    const [events, setEvents] = useState([]);
    const [appointements, setAppointements] = useState([]);
    const [availability, setAvailability] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedTime, setSelectedTime] = useState({
        start: '',
        end: '',
    });

    useEffect(() => {
        const fetchAvailability = async () => {
            try {
                const response = await axios.get(`${SERVER}/appointments/getAvailability`);
                if (response.status === 200) {
                    setAvailability(response.data.dispo);
                }
            } catch (err) {
                console.log(err);
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
    
        fetchAvailability();
        fetchApp();
        fetchEvents();
    }, []);    

    const saveAvailability = async (start, end) => {
        try {
            const formatDateForMySQL = (date) => {
                return date.toLocaleString('sv-SE').replace('T', ' ');
            };

            const startFormatted = formatDateForMySQL(new Date(start));
            const endFormatted = formatDateForMySQL(new Date(end));

            const response = await axios.post(`${SERVER}/appointments/saveAvailability`, {
                start: startFormatted,
                end: endFormatted,
            });

            if (response.status === 200) {
                toast.success("Availability saved successfully!");

                const newAvailability = {
                    id: response.data.id,
                    title: 'Available',
                    start_date: startFormatted,
                    end_date: endFormatted,
                };

                setAvailability((prevAvailability) => [...prevAvailability, newAvailability]);
                setEvents((prevEvents) => [
                    ...prevEvents,
                    {
                        id: newAvailability.id,
                        title: 'Available',
                        start: newAvailability.start_date,
                        end: newAvailability.end_date,
                        backgroundColor: 'green',
                    }
                ]);
            }
        } catch (error) {
            console.error('Error saving availability:', error);
            toast.error("Failed to save availability.");
        }
    };

    const handleDateSelect = (selectInfo) => {
        const { start, end } = selectInfo;

        setSelectedTime({
            start: dayjs(start).format('YYYY-MM-DDTHH:mm'),
            end: dayjs(end).format('YYYY-MM-DDTHH:mm'),
        });
        setOpenModal(true);
    };

    const handleSave = () => {
        const start = new Date(selectedTime.start);
        const end = new Date(selectedTime.end);

        saveAvailability(start, end);
        setOpenModal(false);
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

    const createAvailabilitySegments = (availability, appointments) => {
        const segments = [];

        availability.forEach(avail => {
            let availStart = new Date(avail.start_date);
            let availEnd = new Date(avail.end_date);

            appointments.forEach(appointment => {
                let appStart = new Date(appointment.start_date);
                let appEnd = new Date(appointment.end_date);

                if (appStart < availEnd && appEnd > availStart) {
                    if (availStart < appStart) {
                        segments.push({
                            id: `avail-${avail.id}-before-${appointment.id}`,
                            title: 'Available',
                            start: availStart.toISOString(),
                            end: appStart.toISOString(),
                            overlap: false,
                            display: 'background',
                            color: 'green',
                            editable: false,
                        });
                    }

                    if (availEnd > appEnd) {
                        availStart = appEnd;
                    } else {
                        availStart = availEnd;
                    }
                }
            });

            if (availStart < availEnd) {
                segments.push({
                    id: `avail-${avail.id}-after`,
                    title: 'Available',
                    start: availStart.toISOString(),
                    end: availEnd.toISOString(),
                    overlap: false,
                    display: 'background',
                    color: 'green',
                    editable: false,
                });
            }
        });

        return segments;
    };

    const appointmentEvents = appointements.map(appointment => ({
        id: appointment.id,
        title: appointment.username,
        start: appointment.start_date,
        end: appointment.end_date,
        backgroundColor: 'red',
        overlap: true,
    }));
    
    const availabilitySegments = createAvailabilitySegments(availability, appointements);
    
    const formattedEvents = events.map(event => ({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        allDay: event.allDay || false,
        backgroundColor: event.backgroundColor || 'blue',
    }));
    
    const combinedEvents = [...appointmentEvents, ...availabilitySegments, ...formattedEvents];

    const handleEventClick = (info) => {
        tippy(info.el, {
            content: `
                Rendez vous avec: ${info.event.title} <br /> 
                Commence: ${dayjs(info.event.start).format('DD/MM/YYYY à HH:mm')} <br /> 
                Se fini: ${dayjs(info.event.end).format('DD/MM/YYYY à HH:mm')} <br /> 
                Lien du rendez vous: 
                <a 
                    style={{color: 'white'}} 
                    target='_blank' 
                    href='http://localhost:3000/appointment/${info.event.appointement_link}' 
                    onclick="event.stopPropagation();" // Prevent click event propagation
                > 
                    Lien 
                </a>`,
            allowHTML: true,
            placement: 'top',
            trigger: 'click',
            zIndex: '99999',
            onShow(instance) {
                const link = instance.popper.querySelector('a');
                if (link) {
                    link.addEventListener('click', (event) => {
                        event.stopPropagation();
                    });
                }
            }
        });
    };    

    return (
        <AdminLayout>
            <ErrorBoundary>
                <div className="agenda">
                    <ToastContainer />
                    <h1> Mon Agenda </h1>
                    <div className='main'>
                        <div id="calendar-container">
                            <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                                initialDate={new Date()}
                                validRange={{ start: new Date() }}
                                hiddenDays={[0, 6]}  
                                initialView='timeGridWeek'
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek', 
                                }}
                                editable={false}
                                selectable={true}
                                select={handleDateSelect}
                                events={combinedEvents}
                                slotMinTime='08:00:00'
                                slotMaxTime='20:00:00'
                                slotLabelFormat={{ hour: 'numeric', minute: '2-digit', hour12: false }}
                                eventClick={handleEventClick} // Add this line
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
                    </div>
                </div>
            </ErrorBoundary>
        </AdminLayout>  
    );
}

export default Agenda;
