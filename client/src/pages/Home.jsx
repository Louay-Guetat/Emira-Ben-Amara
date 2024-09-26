import '../scss/pages/Home.scss';
import Layout from '../Layouts/Layout';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import temoi from '../utils/testAudio.mp3';
import video from '../utils/test.mp4'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import facebook from '../utils/icons/facebook.png';
import instagram from '../utils/icons/instagram.png';
import whatsapp from '../utils/icons/whatsapp.png';
import linkedin from '../utils/icons/linkedin.png';
import gmail from '../utils/icons/gmail.png';

const Home = () => {
    const navigate = useNavigate();
    const audioRef = useRef(null);
    const videoRef = useRef(null);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [isPlayingVideo, setIsPlayingVideo] = useState(false);

    const handleSignUp = () =>{
        navigate('/SignUp');
    }

    const scrollToTemoignage = () => {
        const temoignageSection = document.getElementById('temoignage');
        if (temoignageSection) {
            temoignageSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const toggleAudioPlay = () => {
        if (isPlayingAudio) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlayingAudio(!isPlayingAudio);
    };

    const toggleVideoPlay = () => {
        if (isPlayingVideo) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlayingVideo(!isPlayingVideo);
    };

    // Use useEffect to listen for when the audio and video end
    useEffect(() => {
        const audio = audioRef.current;
        const video = videoRef.current;

        const handleAudioEnd = () => {
            setIsPlayingAudio(false);
        };

        const handleVideoEnd = () => {
            setIsPlayingVideo(false);
        };

        // Add event listeners for 'ended' event
        audio.addEventListener('ended', handleAudioEnd);
        video.addEventListener('ended', handleVideoEnd);

        // Cleanup event listeners when component unmounts
        return () => {
            audio.removeEventListener('ended', handleAudioEnd);
            video.removeEventListener('ended', handleVideoEnd);
        };
    }, []);

    return (
        <Layout>
            <div className='home-container'>
                <div className='home-banner'>
                    <h1>Commencez Votre Voyage Maintenant!</h1>
                    <span>
                        Transformez votre vie avec les méthodes éprouvées de coaching d'Emira.<br />
                        Rejoignez des centaines de personnes qui ont déjà franchi le pas vers une nouvelle vie.
                    </span>
                    <button onClick={handleSignUp}>Inscrivez Vous !</button>
                </div>
                <div className='temoignage' id='temoignage'>
                    <h1>Témoignages Clients</h1>
                    <span>
                        Écoutez les expériences de nos clients qui ont suivi les programmes d'Emira et transformé leur vie.
                        Leur parcours pourrait inspirer le vôtre.
                    </span>
                    
                    {/* Custom Audio Player */}
                    <div className="custom-audio-player">
                        <audio ref={audioRef} src={temoi} />
                        <div className="audio-waveform">
                            {[...Array(50)].map((_, i) => (
                                <div key={i} className={`wave-line wave-line-${i + 1}`} />
                            ))}
                        </div>
                        <button className="play-button" onClick={toggleAudioPlay}>
                            {isPlayingAudio ? <FontAwesomeIcon icon={faPause} color='white' /> : <FontAwesomeIcon icon={faPlay} color='white' />}
                        </button>
                    </div>

                    <h1> Découvrez Emira </h1>

                    {/* Custom Video Player */}
                    <div className="custom-video-player">
                        <video 
                            ref={videoRef} 
                            src={video} 
                            onClick={toggleVideoPlay} // Make video clickable to pause/play
                            width="400" 
                            controls={false} 
                        />
                        <button 
                            className={`play-button ${isPlayingVideo ? 'hidden' : ''}`} 
                            onClick={toggleVideoPlay}
                        >
                            {isPlayingVideo ? <FontAwesomeIcon icon={faPause} color='white' /> : <FontAwesomeIcon icon={faPlay} color='white' />}
                        </button>
                    </div>
                </div>
                <div className='programs'>
                    <div className='programs-content'>
                        <h1> Découvrez Nos Programmes </h1>
                        <span> Les programmes d’Emira sont conçus pour vous aider à atteindre vos objectifs, qu’il s’agisse de développement personnel, de carrière, ou de bien-être. Chaque cours est une étape vers une vie plus épanouie </span>
                        <ul>
                            <li> Accès à des vidéos exclusives </li>
                            <li> Séances de coaching personnalisées </li>
                            <li> Accès à vie à tous les contenus </li>
                            <li> Outils et techniques pour booster votre confiance </li>
                            <li> Support continu avec des sessions en direct </li>
                        </ul>
                        <a href='/courses'> Explorez Nos Cours </a>
                    </div>
                </div>
                <div className='start'>
                        <h1> Prêt à Commencer ? </h1>
                        <span> Ne reportez pas votre transformation à demain. Inscrivez-vous aujourd’hui et rejoignez une communauté de personnes déterminées à changer leur vie. </span>
                </div>
                <div className='questions'>
                    <h1> Questions Fréquemment Posées </h1>
                    <ul>  
                        <li> "Quels sont les avantages des cours d’Emira ?" </li>
                        <li> "Comment se déroulent les séances de coaching ?" </li>
                        <li> "Puis-je accéder aux cours à tout moment ?" </li>
                        <li> "Qu’est-ce qui rend les cours d’Emira uniques ?" </li>
                    </ul>
                    <span> Vous avez d’autres questions ? Contactez-nous ici </span>
                    <footer> 
                        <a href='/aboutus'> À propos </a>
                        <a onClick={scrollToTemoignage}> Témoignages </a> {/* Update this link */}
                        <a href=''> FAQ </a>
                        <a href='/contact'> Contact </a>
                        <div className='social-media'> 
                            <i>
                                <img src={instagram} alt="Instagram" />
                            </i>
                            <i>
                                <img src={facebook} alt="Facebook" />
                            </i>
                            <i>
                                <img src={linkedin} alt="Linkedin" />
                            </i>
                            <i>
                                <img src={gmail} alt="Gmail" />
                            </i>
                            <i>
                                <img src={whatsapp} alt="Whatsapp" />
                            </i>
                        </div>
                    </footer>
                    <div className='copyright'> Copyright © 2024 WE TEKUP. Tous droits réservés. </div>
                </div>
            </div>
        </Layout>
    );
};

export default Home;
