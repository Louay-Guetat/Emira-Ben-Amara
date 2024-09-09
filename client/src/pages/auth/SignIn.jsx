import { useState } from 'react';
import Layout from '../../Layouts/Layout';
import '../../scss/pages/auth/SignIn.scss';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { SERVER } from '../../config/config';
import Cookies from 'js-cookie';
import useUser from '../../hooks/useUser';

const SignIn = () => {
    const user = useUser()
    const navigate = useNavigate();
    const [usernameOrEmail, setUsernameOrEmail] = useState('');
    const [pwd, setPwd] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${SERVER}/auth/login`, {
                usernameOrEmail,
                password: pwd
            });

            if (response.status === 200) {
                // Set the token as a cookie with expiration of 1 day
                Cookies.set('token', response.data.token, { expires: 1 });
                if (response.data.user.role === 'admin'){
                    navigate('/admin/dashboard')
                }else{
                    navigate('/');
                }
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred during login");
        }
    };

    if (user.user){
        navigate('/')
    }

    return (
        <Layout>
            <div className="SignIn">
                <form className="signin-form" onSubmit={handleSubmit}>
                    <h2>Sign In</h2>
                    <div className="form-group">
                        <label htmlFor="usernameOrEmail">Username or Email</label>
                        <input
                            type="text"
                            id="usernameOrEmail"
                            value={usernameOrEmail}
                            onChange={(e) => setUsernameOrEmail(e.target.value)}
                            placeholder="Enter your username or email"
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
                    <button type="submit" className="signin-btn">Sign In</button>
                </form>
            </div>
        </Layout>
    );
};

export default SignIn;
