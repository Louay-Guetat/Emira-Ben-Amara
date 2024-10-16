import { NavLink, useNavigate } from 'react-router-dom';
import '../scss/components/Navbar.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-regular-svg-icons'; // Import the regular version of the user icon
import { SERVER } from '../config/config';
import axios from 'axios';
import { faBars, faGauge, faRightToBracket, faX } from '@fortawesome/free-solid-svg-icons';
import useUser from '../hooks/useUser';
import logo from '../utils/logo.svg'
import { useState } from 'react';

const Navbar = () => {
    const { user, loading } = useUser();    
    const navigate = useNavigate()
    const [navbarOpen, setNavbarOpen] = useState(false)

    const logout = async () => {
        try {
            await axios.post(`${SERVER}/auth/logout`, {}, { withCredentials: true });
            
            if (window.location.pathname === '/') {
                window.location.reload();
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    };
    
    const Dashboard = () =>{
        navigate('/admin/dashboard')
    }

    return (
        <>
            <div className='navbar'>
                <div className='logo'>
                    <img src={logo} alt="Logo" />
                </div>
                <div className='links'>
                    <NavLink to='/' activeclassname='active'>
                        Accueil
                    </NavLink>
                    <NavLink to='/aboutEmira' activeclassname='active'>
                        à propos
                    </NavLink>
                    <NavLink to='/courses' activeclassname='active'>
                        Cours
                    </NavLink>
                    <NavLink to='/book' activeclassname='active'>
                        Réserver une séance
                    </NavLink>
                    <NavLink to='/events' activeclassname='active'>
                        Participer à un événement
                    </NavLink>
                    <NavLink to='/contact' activeclassname='active'>
                        Contact
                    </NavLink>
                    <NavLink to='/Books' activeclassname='active'>
                        Livres
                    </NavLink> 
                    <NavLink to='/Blogs' activeclassname='active'>
                        Blog
                    </NavLink>
                </div>
                
                    
                { user ? 
                    (
                        <div className='profile'>
                            <NavLink to='/Profile' activeclassname='active'>
                                <FontAwesomeIcon icon={faUser} size='xl' />
                            </NavLink> 
                            {user.role === 'admin' ? (<button onClick={Dashboard}><FontAwesomeIcon icon={faGauge} size='2xl' color='white' /></button>) : null}
                            <button onClick={logout}> <FontAwesomeIcon icon={faRightToBracket} size='xl' /> </button>
                        </div>
                    ) : (
                        <div className='auth'>
                            <button onClick={() => navigate('/SignIn')}> Connexion </button>
                            <button onClick={() => navigate('/SignUp')}> S'inscrire </button>
                        </div>
                    )
                }
            </div>
            <div className='mobileNavbar'>
                {!navbarOpen && <button id='openButton' onClick={() => setNavbarOpen(true)}> <FontAwesomeIcon icon={faBars} /> </button>}
                {navbarOpen && (
                    <div className='mobileNavbarOpened'>
                        <button id='closeButton' onClick={() => setNavbarOpen(false)}> <FontAwesomeIcon icon={faX} /> </button>
                        <div className='logo'>
                            <img src={logo} alt="Logo" />
                        </div>
                        <div className='links'>
                            <NavLink to='/' activeclassname='active'>
                                Accueil
                            </NavLink>
                            <NavLink to='/aboutEmira' activeclassname='active'>
                                à propos
                            </NavLink>
                            <NavLink to='/courses' activeclassname='active'>
                                Cours
                            </NavLink>
                            <NavLink to='/book' activeclassname='active'>
                                Réserver une séance
                            </NavLink>
                            <NavLink to='/events' activeclassname='active'>
                                Participer à un événement
                            </NavLink>
                            <NavLink to='/contact' activeclassname='active'>
                                Contact
                            </NavLink>
                            <NavLink to='/Books' activeclassname='active'>
                                Livres
                            </NavLink> 
                            <NavLink to='/Blogs' activeclassname='active'>
                                Blog
                            </NavLink>
                        </div>
                        
                            
                        { user ? 
                            (
                                <div className='profile'>
                                    <NavLink to='/Profile' activeclassname='active'>
                                        <FontAwesomeIcon icon={faUser} size='xl' />
                                    </NavLink> 
                                    {user.role === 'admin' ? (<button onClick={Dashboard}><FontAwesomeIcon icon={faGauge} size='2xl' color='white' /></button>) : null}
                                    <button onClick={logout}> <FontAwesomeIcon icon={faRightToBracket} size='xl' /> </button>
                                </div>
                            ) : (
                                <div className='auth'>
                                    <button onClick={() => navigate('/SignIn')}> Connexion </button>
                                    <button onClick={() => navigate('/SignUp')}> S'inscrire </button>
                                </div>
                            )
                        }
                    </div>
                )}
            </div>
        </>
    );
}

export default Navbar;
