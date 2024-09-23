import { useEffect, useState } from 'react';
import '../scss/pages/ThemeParts.scss'
import axios from 'axios';
import { SERVER } from '../config/config';
import Module from './Module';
import { loadStripe } from '@stripe/stripe-js';
import useUser from '../hooks/useUser';

const ThemeParts = ({theme}) =>{
    const {user, loading} = useUser()
    const [themeParts, setThemeParts] = useState([])
    const [themePart, setThemePart] = useState()
    const [owned, setOwned] = useState(false)
    const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

    useEffect(()=>{
        const fetchThemeParts = async () =>{
            try {
                const themeID = theme.id
                console.log(themeID)
                const response = await axios.get(`${SERVER}/themeParts/getThemeParts`, {
                  params: { themeID },
                });

                if (response.status === 200) {
                  setThemeParts(response.data.themeParts);
                }
              } catch (err) {
                console.log(err);
              }
        }

        const fetchThemeOwned = async () =>{
            try{
                const response = await axios.get(`${SERVER}/stripe/getThemeOwned`, {
                    params:{
                        theme_id : theme.id,
                        user_id : user.id
                    }
                })

                if (response.status === 200){
                    setOwned(response.data.owned)
                }
            }catch(err){
                console.log(err)
            }
        }

        if (theme && user){
            fetchThemeParts()
            fetchThemeOwned()
        }
    }, [theme, user])

    const buyThemeParts = async () => {
        try {
            const response = await axios.post(`${SERVER}/stripe/checkout`, {
                theme: {
                    name: theme.title,
                    price: theme.price,
                    id: theme.id // Add theme_id
                },
                user_id: user.id // Add user_id from current logged-in user
            });
            const { sessionId } = response.data;
    
            const stripe = await stripePromise;
            const { error } = await stripe.redirectToCheckout({ sessionId });
    
            if (error) {
                console.error('Error during checkout:', error);
            }
        } catch (error) {
            console.log(error);
        }
    };      

    return(
        <>
        {themePart ? (
            <Module theme={theme} themePart={themePart} />
        ) : (
            <div className="themePartsDetails">
                <h1> {theme.title} </h1>
                <div className='parts'>
                    <img src={theme.image} alt={theme.title} />
                    <div className='parts-details'>
                        <span> {theme.description} </span>
                        <ol>
                            {themeParts.length > 0 && 
                            themeParts.map((themePart) => (
                                <li key={themePart.id} onClick={() => { if (owned) setThemePart(themePart); }}>
                                    {themePart.title}
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
                {owned === false ? (
                    <button onClick={buyThemeParts}> Acheter maintenant </button>
                ) : (
                    <></>
                ) }
                
            </div>
        )}
        </>
    )
}

export default ThemeParts;