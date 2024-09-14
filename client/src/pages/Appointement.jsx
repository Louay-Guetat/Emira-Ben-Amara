import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css"; // Import the styles for the datepicker
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faPhone, faQuoteRight, faSignature, faVoicemail} from '@fortawesome/free-solid-svg-icons';
import Layout from '../Layouts/Layout';
import '../scss/pages/Appointement.scss';
import banner from '../utils/home-banner.jpeg';
import useUser from '../hooks/useUser';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';
import axios from 'axios';
import { SERVER } from '../config/config';

const Appointement = () => {
    const [startDate, setStartDate] = useState(null);
    const [timezoneInfo, setTimezoneInfo] = useState('');
    const { user, loading } = useUser();    
    const [email, setEmail] = useState()
    const [phone, setPhone] = useState()
    const [name, setName] = useState()

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
    }, []);

    const handleAppointment = async (e) => {
        e.preventDefault();
        console.log(user)
        try {
            const formData = new FormData();
            if (user) {
                formData.append('email', user.email);
                formData.append('phone', user.phone);
                formData.append('name', user.username);
                formData.append('uid', user.id);
            } else {
                formData.append('email', email);
                formData.append('phone', phone);
                formData.append('name', name);
            }
            const formatDateToMySQL = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');
                
                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            };
    
            const formattedDate = formatDateToMySQL(new Date(startDate));
            formData.append('desired_date', formattedDate);
            
            const response = await axios.post(`${SERVER}/appointments/setAppointment`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            
            if (response.status === 200) {
                alert('Votre rendez-vous a été enregistré avec succès.');
            }
        } catch (err) {
            console.log(err);
        }
    };    

    return (
        <Layout>
            <div className='appointement'>
                <h1> Réservez votre place dès maintenant! </h1>
                <span> Transformez votre vie dès aujourd'hui avec nos événements inspirants. </span>
                <div className='get-appointement'>
                    <img src={banner} alt='banner' />
                    <form className='get' onSubmit={handleAppointment}>
                        <h3> Atelier de développement personnel </h3>
                        <div className='quote'>
                            <FontAwesomeIcon icon={faQuoteRight} size='lg' color='lightgray' />
                            <span> Rejoignez-nous pour un atelier intensif de 2 jours, axé sur la confiance en soi et la réalisation de vos objectifs personnels. </span>
                        </div>
                        {
                            !user && (
                                <div className='unauth-container'>
                                    <div className='input-container'>
                                        <FontAwesomeIcon icon={faEnvelope} className="calendar-icon" />
                                        <input type='email' placeholder='Entrer votre Email' onChange={(e) => setEmail(e.target.value)} required />
                                    </div>
                                    <div className='input-container'>
                                        <FontAwesomeIcon icon={faPhone} className="calendar-icon" />
                                        <input type='text' placeholder='Entrer votre Numéro de Téléphone' onChange={(e) => setPhone(e.target.value)} required />
                                    </div>
                                    <div className='input-container'>
                                        <FontAwesomeIcon icon={faSignature} className="calendar-icon" />
                                        <input type='text' placeholder='Entrer votre Nom complet' onChange={(e) => setName(e.target.value)} required />
                                    </div>
                                </div>
                            )}
                        <div className="input-container">
                            <FontAwesomeIcon icon={faCalendarAlt} className="calendar-icon" />
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                showTimeSelect
                                dateFormat="dd/MM/yyyy, hh:mm "
                                placeholderText="Choisir date et Heure"
                                required
                            />
                        </div>
                        <label> Fuseau horaire de l'événement: {timezoneInfo} </label>
                        <button type='submit'> Réserver </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
};

export default Appointement;
