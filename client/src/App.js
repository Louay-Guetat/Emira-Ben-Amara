import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Cours from './pages/Cours';
import Dashboard from './pages/admin/Dashboard';
import Agenda from './pages/admin/Agenda';
import ProtectedRoute from './hooks/ProtectedRoute';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Themes from './pages/admin/Themes';
import Visioconference from './pages/visioconference';
import Contact from './pages/Contact';
import Events from './pages/admin/Events';
import DisplayEvents from './pages/DisplayEvents';
import Reserver from './pages/Reserver';
import Complete from './payments/Success';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/courses' element={<Cours />} />
        <Route path='/book' element={<Reserver />} />
        <Route path='/events' element={<DisplayEvents />} />
        <Route path='/contact' element={<Contact />} />

        {/* Auth links */}
        <Route path='/signin' element={<SignIn />} />
        <Route path='/signup' element={<SignUp />} />

        {/* Admin protected routes */}
        <Route path='/admin/dashboard' element={<ProtectedRoute element={Dashboard} />} />
        <Route path='/admin/agenda' element={<ProtectedRoute element={Agenda} />} />
        <Route path='/admin/themes' element={<ProtectedRoute element={Themes} />} />
        <Route path='/admin/events' element={<Events />} />


        {/* Visioconference routes */}
        <Route path='/visioconference' element={<Visioconference />} />

        {/* Payment Redirection pages */}
        <Route path='/complete/:user_id/:theme_id' element={<Complete />} />
      </Routes>
    </Router>
  );
};

export default App;
