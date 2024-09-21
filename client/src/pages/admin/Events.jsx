import React, { useState, useEffect } from 'react';
import "react-datepicker/dist/react-datepicker.css"; // Import the styles for the datepicker
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuoteRight} from '@fortawesome/free-solid-svg-icons';
import AdminLayout from '../../Layouts/AdminLayout';
import '../../scss/pages/admin/Events.scss';
import banner from '../../utils/home-banner.jpeg';
import useUser from '../../hooks/useUser';
import axios from 'axios';
import { SERVER } from '../../config/config';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const Events = () => {
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [startDate, setStartDate] = useState(null);
    const [timezoneInfo, setTimezoneInfo] = useState('');
    const { user, loading } = useUser();
    const [events, setEvents] = useState([])

    useEffect(() => {
        // Get the IANA timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Get the UTC offset in minutes and convert to hours
        const offsetMinutes = new Date().getTimezoneOffset();
        const offsetHours = -offsetMinutes / 60;

        // Format the offset as GMT+/-HH:MM
        const sign = offsetHours >= 0 ? '+' : '-';
        const absOffsetHours = Math.abs(Math.floor(offsetHours)).toString().padStart(2, '0');
        const absOffsetMinutes = Math.abs((offsetHours % 1) * 60).toString().padStart(2, '0');
        const gmtOffset = `GMT${sign}${absOffsetHours}:${absOffsetMinutes}`;

        // Combine timezone and GMT offset
        setTimezoneInfo(`${timezone} ${gmtOffset}`);

        const fetchEvents = async () =>{
            try{
                const response = await axios.get(`${SERVER}/events/getEvents`)
                if (response.status === 200){
                    setEvents(response.data.events)
                    console.log(response.data.events)
                }
            }catch(err){
                console.log(err)
            }
        }

        fetchEvents()
    }, []);

    const createEvent = async (e) => {
        e.preventDefault();
        try {
            const eventData = {
                nom: name,
                description: description,
                price: parseFloat(price) === 0 || price === '' ? 0.0 : parseFloat(price),
                date_event: new Date(startDate).toISOString().slice(0, 19).replace('T', ' '),
            };
    
            const response = await axios.post(`${SERVER}/events/createEvent`, eventData);
    
            if (response.status === 200) {
                setName('');
                setDescription('');
                setPrice('');
                setStartDate(null);
            }
        } catch (error) {
            console.log(error);
        }
    };
    

    if(loading){
        return <div>Loading...</div>;
    }else if(user.role !== 'admin'){
        navigate('/')
    }

    return (
        <AdminLayout>
            <div className='appointement'>
                <h1> Réservez votre place dès maintenant! </h1>
                <span> Transformez votre vie dès aujourd'hui avec nos événements inspirants. </span>
                <div className='get-appointement'>
                    <img src={banner} alt='banner' />
                    <form className='get' onSubmit={createEvent}>
                        <h3> Atelier de développement personnel </h3>
                        <div className='quote'>
                            <FontAwesomeIcon icon={faQuoteRight} size='lg' color='lightgray' />
                            <span> Rejoignez-nous pour un atelier intensif de 2 jours, axé sur la confiance en soi et la réalisation de vos objectifs personnels. </span>
                        </div>
                        <input type='text' placeholder="Nom de l'événement" value={name} onChange={(e) => setName(e.target.value)} />
                        <textarea placeholder="Donner une brief description sur l'évenement..." value={description} onChange={(e) => setDescription(e.target.value)} />
                        <input type='text' placeholder="Donner le prix de l'événement (0 si l'événement est gratuit)" value={price} onChange={(e) => setPrice(e.target.value)}/>
                        <div className="input-container">
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DateTimePicker
                                    label="Choisir la date et l'heure du rendez-vous que vous souhaité"
                                    value={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    minDate={dayjs().add(1, 'day')}
                                    minTime={dayjs().hour(8).minute(0)}
                                    maxTime={dayjs().hour(19).minute(0)}
                                    ampm={false}
                                />
                            </LocalizationProvider>
                        </div>
                        <label> Fuseau horaire de l'événement: {timezoneInfo} </label>
                        <button type='submit'> Créer l'événement </button>
                    </form>
                </div>
            </div>
            <div className='events'>
                {events.length > 0 ? (
                    <div className='event-container'>
                        {events.map((event) => (
                            <div className='event-card' key={event.id}> 
                                <h1> {event.name} </h1>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div>No events found</div>
                )}
            </div>
        </AdminLayout>
    );
};

export default Events;
