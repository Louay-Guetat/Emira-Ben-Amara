import '../scss/pages/Home.scss';
import Layout from '../Layouts/Layout';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { ReactComponent as Icon } from '../utils/icons/quotes.svg';
import temoi_image from '../utils/temoi.png';
import star from '../utils/icons/star.png';
import video from '../utils/test.mp4';
import temoi from '../utils/testAudio.mp3';
import temoignage_video from '../utils/temoignage_video.mp4';
import { SERVER } from '../config/config';
import Blogs from './Blogs';

const Home = () => {
    const navigate = useNavigate();
    const audioRef = useRef(null);
    const videoRef = useRef(null);
    const cursorRef = useRef(null);
    const temoignage_video_ref = useRef(null);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [isPlayingVideo, setIsPlayingVideo] = useState(false);
    const [blogs, setBlogs] = useState([]);
    const [blog, setBlog] = useState(null);

    const cards = [
        { id: 1, content: "I'm absolutely in love with Borcelle's services. I've been a customer for over 6 months now, and they are just the best." },
        { id: 2, content: "I'm. I've been a customer for over 6 months now, and they are just the best." },
        { id: 3, content: "I'm absolutely in love with Borcelle's services. I've been a customer for over 6 months now, and they are just the best." },
        { id: 4, content: "I'm . I've been a customer for over 6 months now, and they are just the best." },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState('');

    const handleNext = () => {
        setDirection('next');
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % cards.length);
            setDirection('');
        }, 1000);
    };

    const handlePrevious = () => {
        setDirection('previous');
        setTimeout(() => {
            setCurrentIndex((prevIndex) => (prevIndex - 1 + cards.length) % cards.length);
            setDirection('');
        }, 1000);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(date);
    };

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get(`${SERVER}/blogs/getLatestBlogs`);
                if (response.status === 200) {
                    setBlogs(response.data.blogs);
                }
            } catch (e) {
                console.log(e);
            }
        };
        fetchBlogs();
    }, []);

    const handleSignUp = () => {
        navigate('/SignUp');
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

    useEffect(() => {
        const updateCursorPosition = () => {
            if (audioRef.current && cursorRef.current) {
                const progress = (audioRef.current.currentTime / audioRef.current.duration) * 125;
                cursorRef.current.style.left = `${progress + 5}%`;
            }
        };

        const resetCursorPosition = () => {
            if (cursorRef.current) {
                cursorRef.current.style.left = '0%';
            }
        };

        if (audioRef.current) {
            audioRef.current.addEventListener('timeupdate', updateCursorPosition);
            audioRef.current.addEventListener('ended', resetCursorPosition);
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('timeupdate', updateCursorPosition);
                audioRef.current.removeEventListener('ended', resetCursorPosition);
            }
        };
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        const video = videoRef.current;

        const handleAudioEnd = () => {
            setIsPlayingAudio(false);
        };

        const handleVideoEnd = () => {
            setIsPlayingVideo(false);
        };

        if (audio) {
            audio.addEventListener('ended', handleAudioEnd);
        }

        if (video) {
            video.addEventListener('ended', handleVideoEnd);
        }

        return () => {
            if (audio) {
                audio.removeEventListener('ended', handleAudioEnd);
            }
            if (video) {
                video.removeEventListener('ended', handleVideoEnd);
            }
        };
    }, []);

    const disableRightClick = (e) => {
        e.preventDefault();
    };

    if (blog) {
        return <Blogs blogItem={blog} />;
    } else {
        return (
            <Layout>
                <div className="home-container">
                    {/* Banner */}
                    <div className="home-banner">
                        <h1>Inspirez, Changez, Rayonnez : L’Art de Votre Évolution Personnel</h1>
                        <span>
                            Transformez votre vie avec les méthodes éprouvées de coaching d'Emira.<br />
                            Rejoignez des centaines de personnes qui ont déjà osé faire le premier pas vers le changement et découvert une vie pleine de possibilités!
                        </span>
                        <button onClick={handleSignUp}>Rejoignez notre communauté !</button>
                    </div>

                    {/* Témoignages */}
                    <div className="temoignage" id="temoignage">
                        <h1>Témoignages Clients</h1>
                        <span>
                            Écoutez les expériences de nos clients qui ont suivi les programmes d'Emira et transformé leur vie.
                            Leur parcours pourrait inspirer le vôtre.
                        </span>

                        {/* Video Testimonial */}
                        <div className="temoignage-video">
                            <video
                                ref={temoignage_video_ref}
                                src={temoignage_video}
                                controls={true}
                                disablePictureInPicture
                                controlsList="nodownload"
                                onContextMenu={disableRightClick}
                            />
                        </div>

                        {/* Carousel */}
                        <div className="carousel-container">
                            <div className="temoignage-text">
                                <button className="carousel-button" onClick={handlePrevious}>
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </button>
                                <div className="cards-container">
                                    {/* Previous Card */}
                                    <div className={`card previous-card ${direction}`}>
                                        <img id="user-icon" src={temoi_image} alt="User icon" />
                                        <div className="stars">
                                            {[...Array(5)].map((_, i) => (
                                                <img key={i} src={star} alt="Star" />
                                            ))}
                                        </div>
                                        <span>{cards[(currentIndex - 1 + cards.length) % cards.length].content}</span>
                                        <Icon />
                                    </div>

                                    {/* Current Card */}
                                    <div className={`card current-card ${direction}`}>
                                        <img id="user-icon" src={temoi_image} alt="User icon" />
                                        <div className="stars">
                                            {[...Array(5)].map((_, i) => (
                                                <img key={i} src={star} alt="Star" />
                                            ))}
                                        </div>
                                        <span>{cards[currentIndex].content}</span>
                                        <Icon />
                                    </div>

                                    {/* Next Card */}
                                    <div className={`card next-card ${direction}`}>
                                        <img id="user-icon" src={temoi_image} alt="User icon" />
                                        <div className="stars">
                                            {[...Array(5)].map((_, i) => (
                                                <img key={i} src={star} alt="Star" />
                                            ))}
                                        </div>
                                        <span>{cards[(currentIndex + 1) % cards.length].content}</span>
                                        <Icon />
                                    </div>
                                </div>
                                <button className="carousel-button" onClick={handleNext}>
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </button>
                            </div>
                        </div>

                        {/* Video Introduction */}
                        <h1> Découvrez Emira </h1>
                        <div className="custom-video-player">
                            <video
                                ref={videoRef}
                                src={video}
                                onClick={toggleVideoPlay}
                                width="400"
                                controls={false}
                                disablePictureInPicture
                                controlsList="nodownload"
                                onContextMenu={disableRightClick}
                            />
                            <button className={`play-button ${isPlayingVideo ? 'hidden' : ''}`} onClick={toggleVideoPlay}>
                                {isPlayingVideo ? <FontAwesomeIcon icon={faPause} color="white" /> : <FontAwesomeIcon icon={faPlay} color="white" />}
                            </button>
                        </div>
                        <button id="about-button" onClick={() => navigate('/aboutEmira')}>
                            Découvrir mieux Emira
                        </button>
                    </div>

                    {/* Programs Section */}
                    <div className="programs">
                        <div className="programs-content">
                            <h1> Découvrez Nos Programmes </h1>
                            <span>
                                Les programmes d’Emira sont conçus pour vous aider à atteindre vos objectifs, qu’il s’agisse de développement personnel, de carrière, ou de bien-être. Chaque cours est une étape vers une vie plus épanouie.
                            </span>
                            <ul>
                                <li> Accès à des vidéos exclusives </li>
                                <li> Séances de coaching personnalisées </li>
                                <li> Accompagnement VIP </li>
                                <li> Support continu avec des sessions en direct </li>
                                <li> Accès à vie à tous les contenus </li>
                                <li> Ateliers interactifs </li>
                                <li> Ressources puissantes et méthodes éprouvées </li>
                            </ul>
                            <button onClick={() => navigate('/courses')}> Explorez Nos Cours </button>
                        </div>
                    </div>

                    {/* Blogs Section */}
                    <div className="last-blogs">
                        <h1> Nos Dernières Inspirations </h1>
                        <div className="blogs-card-home">
                            {blogs.length > 0 ? (
                                blogs.map((blog) => (
                                    <div className="blog" key={blog.id}>
                                        <div className="image">
                                            <img src={`${SERVER}${blog.image}`} alt="blog" />
                                        </div>
                                        <div className="details">
                                            <p>{formatDate(blog.created_at)}</p>
                                            <h2>{blog.title}</h2>
                                            <hr />
                                            <span>{blog.description}</span>
                                            <button onClick={() => setBlog(blog)}> En savoir plus </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="blog-not-found">Il n'ya aucun blog pour le moment</div>
                            )}
                        </div>
                        <button onClick={() => navigate('/blogs')}> Explorer Tous Nos Articles </button>
                    </div>

                    {/* eBooks Section */}
                    <div className="ebooks-home">
                        <h1> Les e-Books d'Emira </h1>
                        <span>
                            Emira vous propose une sélection d’eBooks pour vous aider à atteindre vos objectifs de vie, améliorer votre bien-être, et développer votre potentiel.
                        </span>
                        <div>
                            <h2> Jusqu’a 70% de réduction </h2>
                            <button onClick={() => navigate('/Books')}> Explorer la Collection Complète </button>
                        </div>
                    </div>

                    {/* Final Call to Action */}
                    <div className="start">
                        <h1> Prêt à Commencer ? </h1>
                        <span>
                            Ne reportez pas votre transformation à demain. Inscrivez-vous aujourd’hui et rejoignez une communauté de personnes déterminées à changer leur vie.
                        </span>
                    </div>
                </div>
            </Layout>
        );
    }
};

export default Home;
