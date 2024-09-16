import AdminLayout from "../../Layouts/AdminLayout";
import React, { useRef, useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list'; 
import axios from 'axios';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SERVER } from "../../config/config";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ErrorBoundary from '../../hooks/ErrorBoundary.jsx';
import '../../scss/pages/admin/Agenda.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-regular-svg-icons'; // Import the regular version of the user icon
import { faCheck } from "@fortawesome/free-solid-svg-icons";

const Agenda = () =>{
    const calendarRef = useRef(null);
    const [events, setEvents] = useState([]);
    const [appointements, setAppointements] = useState([])

    useEffect(() => {
        const draggableEl = document.getElementById('external-events');
        if (draggableEl) {
        const draggable = new Draggable(draggableEl, {
            itemSelector: '.fc-event',
            eventData: function(eventEl) {
            return {
                id: eventEl.id,
                title: eventEl.innerText,
            };
            },
        });

        return () => {  
            draggable.destroy();
        };
        }
    }, []);

    const formatDate = (date) => {
        return new Date(date).toISOString();
    };

    const formatReadableDate = (dateString) => {
        if (!dateString) return "No date";  // Handle null or undefined dates
        
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return "Invalid date";  // Handle invalid date values
        }
        
        // Format the date and time to a readable format, e.g., "September 14, 2024, 4:30 PM"
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) + ', ' + date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: false
        });
    };

    useEffect(() => {
        const fetchEvents = async () => {
        try {
            const response = await axios.get(`${SERVER}/appointments/getAppointments`);
            
            if (response.status === 200) {
                const formattedEvents = response.data.map(event => {
                    if (event.desired_date) {
                    return {
                        ...event,
                        desired_date: formatDate(event.desired_date)
                    };
                    }
                    return event;
                });

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
                console.log(withDateAppointment)
                console.log(withoutDateAppointment)
                setAppointements(withDateAppointment);
                setEvents(withoutDateAppointment);
            }
        } catch (error) {
            console.log(error);
        }
        };

        fetchEvents();
    }, []);

    const ConfirmToast = ({ onConfirm, onCancel, fullname, time }) => (
        <div>
        <p>Do you want to move the event "{fullname}" to "{time}" ?</p>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={onConfirm} style={{ marginRight: 10 }}>Yes</button>
            <button onClick={onCancel}>No</button>
        </div>
        </div>
    );

    const handleEventReceive = (info) => {
        const eventId = parseInt(info.draggedEl.id);
        const event = events.find(event => event.id === eventId);
        
        if (event) {
            event.confirmed_date = info.date
            const updatedEvent = event
        
            const onConfirm = async () => {
                setEvents(prevEvents => prevEvents.map(e => e.id === eventId ? updatedEvent : e));
                setAppointements(prevAppointments => [...prevAppointments, updatedEvent]);
                updatedEvent.confirmed_date = updatedEvent.confirmed_date.toISOString().slice(0, 19).replace('T', ' ')
                try {
                    await axios.put(`${SERVER}/appointments/confirmAppointment`, updatedEvent);
                } catch (error) {
                    console.error('Error updating the event on the server:', error);
                }
                
                if (info.draggedEl.parentNode) {
                    info.draggedEl.parentNode.removeChild(info.draggedEl);
                }
                toast.dismiss();
            };

            const onCancel = () => {
                toast.dismiss();
                window.location.reload()
            };
            toast.info(
                <ConfirmToast onConfirm={onConfirm} onCancel={onCancel} fullname={event.fullname} time={info.date.toLocaleString()} />, {
                    position: "top-center",
                    autoClose: false,
                    closeOnClick: false,
                    draggable: false,
                    hideProgressBar: true,
                    closeButton: false,
                }
            );
        } else {
            console.error('Event data is not properly defined or event not found:', event);
        }
    };

    const confirmDesiredDate = async (e, item) =>{
        e.preventDefault()
        try{
            item.confirmed_date = new Date(item.desired_date).toISOString().slice(0, 19).replace('T', ' ');;
            console.log(item)
            try {
                const response = await axios.put(`${SERVER}/appointments/confirmAppointment`, item);
                if (response.status === 200){
                    setEvents(prevEvents => prevEvents.map(e => e.id === item.id ? item : e));
                    setAppointements(prevAppointments => [...prevAppointments, item]);
                }
            } catch (error) {
                console.error('Error updating the event on the server:', error);
            }
        }catch(err){
            console.log(err)
        }
    }

    return(
        <AdminLayout>
            <ErrorBoundary>
                <DndProvider backend={HTML5Backend}>
                    <div className="agenda">
                        <ToastContainer />
                        <h1> Mon Agenda </h1>
                        <div className='main'>
                            <div id="external-events">
                            <p><strong>Events</strong></p>
                            {events.length > 0 ? (
                                events.map(item => (
                                <div key={'event' + item.id} id={item.id} className="fc-event">
                                    {item.full_name}<br></br>{formatReadableDate(item.desired_date)}
                                    <button onClick={(e) => confirmDesiredDate(e, item)}> <FontAwesomeIcon icon={faCheck} size="xl" color="green" /> </button>
                                </div>
                                ))
                            ) : (
                                <span>There are no events</span>
                            )}
                            </div>

                            <div id="calendar-container">
                            <FullCalendar
                                ref={calendarRef}
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                                initialView='timeGridWeek'
                                headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay,customEvents', 
                                }}
                                customButtons={{
                                customEvents: {
                                    text: 'Events',
                                    click: () => {
                                    calendarRef.current.getApi().changeView('listWeek');
                                    }
                                }
                                }}
                                editable={true}
                                droppable={true}
                                drop={handleEventReceive}
                                events={appointements.map(event => ({
                                    id: event.id,
                                    title: event.full_name,
                                    phone: event.phone,
                                    email: event.email,
                                    start: event.confirmed_date,
                                    link : event.appointement_link,
                                }))}
                                slotMinTime='08:00:00'
                                slotMaxTime='20:00:00'
                                slotLabelFormat={{ hour: 'numeric', minute: '2-digit', hour12: false }}
                                eventMouseEnter={(info) => {
                                const tooltipInstance = tippy(info.el, {
                                    content: `
                                    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:256px; font-family: 'Poppins', sans-serif;">
                                    <div style="margin-top:5px;"><strong>Name:</strong> ${info.event.title}</div>
                                    <div style="margin-top:5px;"><strong>Date:</strong> ${new Date(info.event.start).toLocaleString()}</div>
                                    <div style="margin-top:5px;"><strong>Phone:</strong> ${info.event.extendedProps.phone}</div>
                                    <div style="margin-top:5px;"><strong>Email:</strong> ${info.event.extendedProps.email}</div>
                                    <div style="margin-top:15px; display:flex; justify-content:space-between; width:100%;">
                                        <a href="/visioconference/${info.event.extendedProps.link}" style="background-color:#4a90e2; padding:10px; font-size:14px;color:white;text-decoration:none;border-radius:5px;" target="_blank">Meeting link</a>
                                        <a href="/visioconference/${info.event.extendedProps.link}" style="background-color:#e74c3c; padding:10px; font-size:14px;color:white;text-decoration:none;border-radius:5px;" target="_blank">Cancel Meeting</a>
                                    </div>
                                    </div>`,
                                    allowHTML: true,
                                    theme: 'light',
                                    placement: 'bottom-start',
                                    interactive: true,
                                    trigger: 'manual',
                                });
                                
                                info.el.addEventListener('click', () => {
                                    tooltipInstance.show();
                                });
                                
                                const handleClickOutside = (event) => {
                                    if (!info.el.contains(event.target) && !tooltipInstance.popper.contains(event.target)) {
                                    tooltipInstance.hide();
                                    document.removeEventListener('click', handleClickOutside);
                                    }
                                };
                                
                                document.addEventListener('click', handleClickOutside);
                                }}
                                
                            />
                            </div>
                        </div>
                    </div>
                </DndProvider>
            </ErrorBoundary>
        </AdminLayout>  
    )
}

export default Agenda;