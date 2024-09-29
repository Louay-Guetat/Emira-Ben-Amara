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
import Contact from './pages/Contact';
import Events from './pages/admin/Events';
import DisplayEvents from './pages/DisplayEvents';
import Reserver from './pages/Reserver';
import Complete from './payments/Success';
import AppointmentPurchaseSuccess from './payments/AppointmentPurchaseSuccess';
import OneToOneMeet from './pages/OneToOneMeet';
import Room from './pages/OneToManyMeet/Room';
import AboutUs from './pages/AboutUs';
import Blogs from './pages/Blogs';
import Books from './pages/Books';
import BlogsAdmin from './pages/admin/BlogsAdmin';
import BooksAdmin from './pages/admin/BooksAdmin';
import BookPurchaseSuccess from './payments/BookPurchaseSuccess';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/courses' element={<Cours />} />
        <Route path='/book' element={<Reserver />} />
        <Route path='/events' element={<DisplayEvents />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/aboutEmira' element={<AboutUs />} />
        <Route path='/Books' element={<Books />} />
        <Route path='/Blogs' element={<Blogs />} />

        {/* Auth links */}
        <Route path='/signin' element={<SignIn />} />
        <Route path='/signup' element={<SignUp />} />

        {/* Admin protected routes */}
        <Route path='/admin/dashboard' element={<ProtectedRoute element={Dashboard} />} />
        <Route path='/admin/agenda' element={<ProtectedRoute element={Agenda} />} />
        <Route path='/admin/themes' element={<ProtectedRoute element={Themes} />} />
        <Route path='/admin/events' element={<Events />} />
        <Route path='/admin/blogs' element={<BlogsAdmin />} />
        <Route path='/admin/books' element={<BooksAdmin />} />


        {/* Visioconference routes */}
        <Route path='/Appointment' element={<OneToOneMeet />} />
        <Route path='/visioconference/:roomId' element={<Room />} />

        {/* Payment Redirection pages */} 
        <Route path='/complete/:user_id/:theme_id' element={<Complete />} />
        <Route path='/complete/:user_id/:start/:end' element={<AppointmentPurchaseSuccess />} />
        <Route path='/BookPurshareComplete/:user_id/:book_id' element={<BookPurchaseSuccess />} />

      </Routes>
    </Router>
  );
};

export default App;
