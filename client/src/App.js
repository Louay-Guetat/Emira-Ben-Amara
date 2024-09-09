import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Cours from './pages/Cours';
import Appointement from './pages/Appointement';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Dashboard from './pages/admin/Dashboard';
import Agenda from './pages/admin/Agenda';
import ProtectedRoute from './hooks/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/courses' element={<Cours />} />
        <Route path='/book' element={<Appointement />} />

        {/* Auth links */}
        <Route path='/signin' element={<SignIn />} />
        <Route path='/signup' element={<SignUp />} />

        {/* Admin protected routes */}
        <Route
          path='/admin/dashboard'
          element={<ProtectedRoute element={Dashboard} />}
        />
        <Route
          path='/admin/agenda'
          element={<ProtectedRoute element={Agenda} />}
        />
      </Routes>
    </Router>
  );
};

export default App;
