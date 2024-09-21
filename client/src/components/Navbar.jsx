import { NavLink, useNavigate } from 'react-router-dom';
import '../scss/components/Navbar.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-regular-svg-icons'; // Import the regular version of the user icon
import { SERVER } from '../config/config';
import axios from 'axios';
import { faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import useUser from '../hooks/useUser';

const Navbar = () => {
    const { user, loading } = useUser();    
    const navigate = useNavigate()

    const logout = async() =>{
        try {
            await axios.post(`${SERVER}/auth/logout`, {}, { withCredentials: true });
            navigate('/')
          } catch (error) {
            console.error('Error logging out:', error);
            throw error;
          }
    }

    return (
        <div className='navbar'>
            <div className='logo'>
                <img src='' alt='logo' />
            </div>
            <div className='links'>
                <NavLink to='/' activeclassname='active'>
                    Accueil
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
                    Contactez-Nous
                </NavLink>
                <NavLink to='/about' activeclassname='active'>
                    à propos de nous
                </NavLink>
                <NavLink to='/books' activeclassname='active'>
                    Livres
                </NavLink>
                <NavLink to='/blog' activeclassname='active'>
                    Blog
                </NavLink>
            </div>
            
                
                { user ? 
                    (
                        <div className='profile'>
                            <FontAwesomeIcon icon={faUser} size='xl' />
                            <button onClick={logout}> <FontAwesomeIcon icon={faRightToBracket} size='xl' /> </button>
                        </div>
                    ) : (
                        <div className='auth'>
                            <button onClick={() => navigate('/SignIn')}> Sign In </button>
                            <button onClick={() => navigate('/SignUp')}> Sign Up </button>
                        </div>
                    )
                }
        </div>
    );
}

export default Navbar;
