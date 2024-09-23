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
                    console.log(response.data.dispo);
                }
            } catch (err) {
                console.log(err);
            }
        };

        const fetchEvents = async () => {
            try {
                const response = await axios.get(`${SERVER}/appointments/getAppointments`);
                if (response.status === 200) {
                    const formattedEvents = response.data.map(event => ({
                        ...event,
                        desired_date: new Date(event.desired_date).toISOString(),
                    }));

                    const { withDateAppointment, withoutDateAppointment } = formattedEvents.reduce(
                        (acc, item) => {
                            if (item.confirmed_date) {
                                acc.withDateAppointment.push(item);
                            } else {
                                acc.withoutDateAppointment.push(item);
                            }
                            return acc;
                        },
                        { withDateAppointment: [], withoutDateAppointment: [] }
                    );

                    setAppointements(withDateAppointment);
                    setEvents(withoutDateAppointment);
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchAvailability();
        fetchEvents();
    }, []);

    const saveAvailability = async (start, end) => {
        try {
            // Ensure start and end are in the proper MySQL datetime format (YYYY-MM-DD HH:MM:SS)
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
    
                // Create a new availability object
                const newAvailability = {
                    id: response.data.id, // Assuming the server responds with the new ID
                    title: 'Available',
                    start_date: startFormatted,
                    end_date: endFormatted,
                };
    
                // Update the availability state directly
                setAvailability((prevAvailability) => [...prevAvailability, newAvailability]);
    
                // Update combined events directly
                setEvents((prevEvents) => [
                    ...prevEvents,
                    {
                        id: newAvailability.id,
                        title: 'Available',
                        start: newAvailability.start_date,
                        end: newAvailability.end_date,
                        backgroundColor: 'green', // For available slots
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

        // Open the modal to adjust the time
        setSelectedTime({
            start: dayjs(start).format('YYYY-MM-DDTHH:mm'),
            end: dayjs(end).format('YYYY-MM-DDTHH:mm'),
        });
        setOpenModal(true);
    };

    const handleSave = () => {
        // Convert back to Date format
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

    const combinedEvents = [
        ...appointements.map(event => ({
            id: event.id,
            title: event.full_name,
            start: event.confirmed_date,
            backgroundColor: 'red',
        })),
        ...availability.map(avail => ({
            id: avail.id,
            title: 'Available',
            start: avail.start_date,
            end: avail.end_date,
            backgroundColor: 'green',
        }))
    ];

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
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay', 
                                }}
                                editable={true}
                                selectable={true}
                                select={handleDateSelect}
                                events={combinedEvents}
                                slotMinTime='08:00:00'
                                slotMaxTime='20:00:00'
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
                    </div>
                </div>
            </ErrorBoundary>
        </AdminLayout>  
    );
}

export default Agenda;
