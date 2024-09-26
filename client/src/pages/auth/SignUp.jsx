import { useState } from 'react';
import Layout from '../../Layouts/Layout';
import '../../scss/pages/auth/SignUp.scss';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { SERVER } from '../../config/config';
import useUser from '../../hooks/useUser';

const SignUp = () => {
    const user = useUser();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [pwd, setPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [phone, setPhone] = useState('+216 ');
    const [error, setError] = useState('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    const phoneRegex = /^\+216\s\d{2}\s\d{3}\s\d{3}$/;

    const formatPhoneNumber = (value) => {
        const phone = value.replace(/\D/g, '');

        if (phone.startsWith('216')) {
            return `+216 ${phone.slice(3, 5)} ${phone.slice(5, 8)} ${phone.slice(8, 11)}`;
        }

        return value;
    };

    const handlePhoneChange = (e) => {
        const formattedPhone = formatPhoneNumber(e.target.value);
        setPhone(formattedPhone);
    };

    const validateForm = () => {
        if (!username.trim()) {
            setError('Le nom d’utilisateur est requis.');
            return false;
        }
        if (!email.trim() || !emailRegex.test(email)) {
            setError('Une adresse email valide est requise.');
            return false;
        }
        if (!phoneRegex.test(phone)) {
            setError('Veuillez saisir un numéro de téléphone tunisien valide (+216 XX XXX XXX).');
            return false;
        }
        if (!pwd) {
            setError('Le mot de passe est requis.');
            return false;
        }
        if (pwd !== confirmPwd) {
            setError('Les mots de passe ne correspondent pas.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            const response = await axios.post(`${SERVER}/auth/register`, {
                username,
                email,
                password: pwd,
                phone
            });

            if (response.status === 201) {
                navigate('/');
            }
        } catch (error) {
            console.error(error);
            setError('Les coordonnées que vous avez saisies ne correspondent pas au formulaire. Merci de vérifier.');
        }
    };

    if (user.user) {
        navigate('/');
    }

    return (
        <Layout>
            <div className="SignUp">
                <form className="signup-form" onSubmit={handleSubmit}>
                    <h1>Sign Up</h1>
                    <span>{error}</span>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="pwd">Password</label>
                        <input
                            type="password"
                            id="pwd"
                            value={pwd}
                            onChange={(e) => setPwd(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPwd">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPwd"
                            value={confirmPwd}
                            onChange={(e) => setConfirmPwd(e.target.value)}
                            placeholder="Confirm your password"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">Phone</label>
                        <input
                            type="text"
                            id="phone"
                            value={phone}
                            onChange={handlePhoneChange}
                            placeholder="Enter your phone number"
                            required
                        />
                    </div>
                    <button type="submit" className="signup-btn">S'inscrire</button>
                </form>
            </div>
        </Layout>
    );
};

export default SignUp;
