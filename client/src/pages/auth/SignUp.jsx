import { useState } from 'react';
import Layout from '../../Layouts/Layout';
import '../../scss/pages/auth/SignUp.scss';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { SERVER } from '../../config/config';
import useUser from '../../hooks/useUser';

const SignUp = () => {
    const user = useUser();
    const navigate = useNavigate()
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [pwd, setPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [phone, setPhone] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (pwd !== confirmPwd) {
            alert("Passwords do not match");
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
            alert("An error occurred during registration");
        }
    };
    
    if (user.user){
        navigate('/')
    }

    return (
        <Layout>
            <div className="SignUp">
                <form className="signup-form" onSubmit={handleSubmit}>
                    <h2>Sign Up</h2>
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
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
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">Phone</label>
                        <input
                            type="text"
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter your phone number"
                        />
                    </div>
                    <button type="submit" className="signup-btn">Sign Up</button>
                </form>
            </div>
        </Layout>
    );
};

export default SignUp;
