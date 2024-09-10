import { useEffect, useState } from 'react';
import '../scss/pages/ThemeParts.scss'
import axios from 'axios';
import { SERVER } from '../config/config';
import Module from './Module';

const ThemeParts = ({theme}) =>{
    const [themeParts, setThemeParts] = useState([])
    const [themePart, setThemePart] = useState()

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

        if (theme){
            fetchThemeParts()
        }
    }, [theme])

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
                                <li key={themePart.id} onClick={() => setThemePart(themePart)}> {themePart.title}</li>
                            ))}
                        </ol>
                    </div>
                </div>
                <button> Acheter maintenant </button>
            </div>
        )}
        </>
    )
}

export default ThemeParts;