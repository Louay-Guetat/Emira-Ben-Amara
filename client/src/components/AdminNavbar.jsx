import { NavLink } from 'react-router-dom';
import '../scss/components/AdminNavbar.scss'

const AdminNavbar = () =>{

    return(
        <div className='admin-navbar'>
            <div className='logo'>
                <img src='' alt='logo' />
            </div>
            
            <div className='links'>
                <NavLink to='/'>
                    Accueil
                </NavLink>
                <NavLink to='/admin/agenda'>
                    Agenda
                </NavLink>
                <NavLink to='/admin/themes'>
                    Themes
                </NavLink>
                <NavLink to='/admin/events'>
                    Events
                </NavLink>
            </div>
        </div>
    )
}

export default AdminNavbar;