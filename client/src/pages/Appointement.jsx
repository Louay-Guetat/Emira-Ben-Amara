import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css"; // Import the styles for the datepicker
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faQuoteRight} from '@fortawesome/free-solid-svg-icons';
import Layout from '../Layouts/Layout';
import '../scss/pages/Appointement.scss';
import banner from '../utils/home-banner.jpeg';

const Appointement = () => {
    const [startDate, setStartDate] = useState(null);
    const [timezoneInfo, setTimezoneInfo] = useState('');

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
    return (
        <Layout>
            <div className='appointement'>
                <h1> Réservez votre place dès maintenant! </h1>
                <span> Transformez votre vie dès aujourd'hui avec nos événements inspirants. </span>
                <div className='get-appointement'>
                    <img src={banner} alt='banner' />
                    <div className='get'>
                        <h3> Atelier de développement personnel </h3>
                        <div className='quote'>
                            <FontAwesomeIcon icon={faQuoteRight} size='lg' color='lightgray' />
                            <span> Rejoignez-nous pour un atelier intensif de 2 jours, axé sur la confiance en soi et la réalisation de vos objectifs personnels. </span>
                        </div>

                        <div className="input-container">
                            <FontAwesomeIcon icon={faCalendarAlt} className="calendar-icon" />
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                showTimeSelect
                                dateFormat="dd/MM/yyyy, hh:mm "
                                placeholderText="Choisir date et Heure"
                            />
                        </div>

                        <label> Fuseau horaire de l'événement: {timezoneInfo} </label>
                        <button> Réserver </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Appointement;
