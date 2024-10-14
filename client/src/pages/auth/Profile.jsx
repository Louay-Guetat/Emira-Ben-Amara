import { useState, useEffect } from "react";
import useUser from "../../hooks/useUser";
import Layout from "../../Layouts/Layout";
import "../../scss/pages/auth/Profile.scss";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { SERVER } from "../../config/config";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-regular-svg-icons';
import PDFModal from '../../components/PDFModal';

const Profile = () => {
    const navigate = useNavigate()
    const { user, loading } = useUser();
    const [view, setView] = useState('Profile');
    const [appointments, setAppointments] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [books, setBooks] = useState([]);

    const [selectedTheme, setSelectedTheme] = useState(null); // New state for selected theme
    const [selectedPart, setSelectedPart] = useState(null); // New state for selected part

    // State initialization
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const [selectedPDF, setSelectedPDF] = useState('');
    const [pdfModalOpen, setPDFModalOpen] = useState(false);

    // Update state when user changes
    useEffect(() => {
        const fetchOwned = async () =>{
            try{
                const response = await axios.get(`${SERVER}/user/getOwned`, {
                    params: {
                        userID: user.id
                    }
                })

                if(response.status === 200){
                    setAppointments(response.data.appointments)
                    setBooks(response.data.books)
                    setLessons(response.data.lessons)
                    console.log(response.data)
                }else{
                    console.log('error')
                }
            }catch(err){
                console.log(err)
            }
        }
        if (user) {
            setEmail(user.email || '');
            setUsername(user.username || '');
            setPhone(user.phone || '');
            fetchOwned()
        }
    }, [user]);

    const disableRightClick = (e) => {
        //e.preventDefault();
    };

    const handlePDFClick = (event, pdfSrc) => {
        event.stopPropagation();
        setSelectedPDF(pdfSrc);
        setPDFModalOpen(true);
    };

    const handleThemeClick = (lesson) => {
        if (selectedTheme === lesson) {
            setSelectedTheme(null); // Collapse if clicked again
        } else {
            setSelectedTheme(lesson); // Set the clicked theme
            setSelectedPart(null); // Reset the selected part
        }
    };

    const handlePartClick = (part) => {
        if (selectedPart === part) {
            setSelectedPart(null); // Collapse if clicked again
        } else {
            setSelectedPart(part); // Set the clicked part
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
    
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        };
    
        // Format date using French locale
        const formattedDate = new Intl.DateTimeFormat('fr-FR', options).format(date);
        
        // Replace "à" with comma (for clarity, since Intl.DateTimeFormat includes "à")
        return formattedDate.replace(',', ', à');
    };

    const splitDescription = (text) => {
        // Find the last period or new line before the middle of the description
        const middleIndex = Math.floor(text.length / 2);
        const regex = /[.\n]/g;
        let lastMatchIndex = -1;
        let match;

        // Find all matches up to the middleIndex
        while ((match = regex.exec(text)) !== null) {
            if (match.index <= middleIndex) {
                lastMatchIndex = match.index;
            } else {
                break;
            }
        }

        // If no period or new line found in the first half, split at the middle index
        if (lastMatchIndex === -1) {
            lastMatchIndex = middleIndex;
        }

        const firstPart = text.slice(0, lastMatchIndex + 1).trim();
        const secondPart = text.slice(lastMatchIndex + 1).trim();

        return [firstPart, secondPart];
    };

    if (!user) {
        return <div>Loading...</div>;
    } else {
        return (
            <Layout>
                <div className="Profile">
                    <div className="div-wallpaper"></div>
                    <div className="main-container">
                        <div className="buttons">
                            <button onClick={() => setView('Profile')}> Mes Informations </button>
                            <button onClick={() => setView('Appointments')}> Mes Rendez vous </button>
                            <button onClick={() => setView('Lessons')}> Mes Cours </button>
                            <button onClick={() => setView('Books')}> Mes Livres </button>
                        </div>
                        {view === 'Profile' ? (
                            <div className="main-Profile">
                                <form>
                                    <div className="form-group">
                                        <label> Username </label>
                                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
                                    </div>
                                    <div className="form-group">
                                        <label> Email </label>
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
                                    </div>
                                    <div className="form-group">
                                        <label> Numéro de Téléphone </label>
                                        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Numéro de Téléphone" />
                                    </div>
                                    <div className="form-group">
                                        <label> Mot de Passe </label>
                                        <input type="password" onChange={(e) => setPassword(e.target.value)} placeholder="********" />
                                    </div>
                                    <div className="form-group">
                                        <label> Confirmer votre Mot de Passe </label>
                                        <input type="password" onChange={(e) => {
                                            if (e.target.value !== password) {
                                                setError("Les mot de passes ne se correspondent pas.");
                                            } else {
                                                setError('');
                                            }
                                        }} placeholder="********" />
                                    </div>

                                    <button> Modifier Votre Profile </button>
                                </form>
                            </div>
                        ) : view === 'Appointments' ? (
                            <div className="main-Appointments">
                                {appointments.length > 0 ? (
                                    appointments.map((rdv) => (
                                        <div key={rdv.id} className="appointment-item">
                                            <span>Vous avez un rendez vous le <u>{formatDate(rdv.start_date)}</u> La durée du rendez-vous est estimé <u>1h15min</u></span>
                                            <span>Voici le lien de votre rendez-vous <a href={`/appointment/${rdv.appointement_link}`} target="_blank"> Lien </a></span>
                                        </div>
                                    ))
                                ) : (
                                    <div className='not-found'>
                                        <span>Vous n'avez aucun rendez-vous</span>
                                        <button onClick={() => navigate('/book')}> Réserve un Rendez-vous </button>
                                    </div>
                                )}
                            </div>
                        ) : view === 'Lessons' ? (
                            <div className="main-Lessons">
                                {lessons.length > 0 ? (
                                    lessons.map((lesson) => (
                                        <div key={lesson.id} className="lesson">
                                            <div className="lesson-details" onClick={() => handleThemeClick(lesson)}>
                                                <img src={`${SERVER}${lesson.image}`} alt="lesson" />
                                                <div>
                                                    <h1>{lesson.title}</h1>
                                                    <span>{lesson.description}</span>
                                                </div>
                                            </div>

                                            {selectedTheme === lesson && lesson.parts.length > 0 && (
                                                <div className="lesson-parts">
                                                    {lesson.parts.map((part) => (
                                                        <div key={part.id} className="part">
                                                            <div className="part-details" onClick={() => handlePartClick(part)}>
                                                                <h1>{part.title}</h1>
                                                                <span>{part.description}</span>
                                                            </div>

                                                            {selectedPart === part && part.modules.length > 0 && (
                                                                <div className="modules-profile">
                                                                    {part.modules.map((module) => (
                                                                        <div key={module.id} className="module">
                                                                            <video src={module.video} 
                                                                                controls
                                                                                disablePictureInPicture
                                                                                controlsList="nodownload"  
                                                                                onContextMenu={disableRightClick}        
                                                                            />
                                                                            <div className='Ressources'>
                                                                                <div onClick={(e) => handlePDFClick(e, `${SERVER}${module.ebook}`)}>
                                                                                    <span>E-Book</span>
                                                                                    <FontAwesomeIcon icon={faFilePdf} />
                                                                                </div>
                                                                                <div onClick={(e) => handlePDFClick(e, `${SERVER}${module.assessments}`)}>
                                                                                    <span>Assessments</span>
                                                                                    <FontAwesomeIcon icon={faFilePdf} />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className='not-found'>
                                        <span>Vous n'avez aucun Thème</span>
                                        <button onClick={() => navigate('/courses')}> Acheter des Thèmes </button>
                                    </div>
                                )}
                            </div>
                        ) : view === 'Books' ? (
                            <div className="main-Books">
                                {books.length > 0 ? (
                                    books.map((book) => {
                                        const [firstPart, secondPart] = splitDescription(book.description);
                                        return(
                                            <div key={book.id} className="book-item">
                                                <h1> {book.title} </h1>
                                                <div className="image-description" onClick={(e) => handlePDFClick(e, `${SERVER}${book.book}`)}>
                                                    <img src={SERVER+book.image} />
                                                    <img src={SERVER+book.description} />
                                                </div>
                                                
                                                <FontAwesomeIcon icon={faFilePdf} />
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className='not-found'>
                                        <span>Vous n'avez aucun Livre</span>
                                        <button onClick={() => navigate('/books')}> Acheter des Livres </button>
                                    </div>
                                )}
                            </div>
                        ) : null }
                    </div>
                </div>
                <PDFModal
                    open={pdfModalOpen}
                    onClose={() => setPDFModalOpen(false)}
                    pdfSrc={selectedPDF}
                />
            </Layout>
        );
    }
}

export default Profile;
