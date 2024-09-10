import { useEffect, useState } from "react";
import Layout from "../Layouts/Layout";
import '../scss/pages/Cours.scss';
import axios from 'axios';
import { SERVER } from '../config/config';
import ThemeParts from "./ThemeParts";

const Cours = () => {
    const [themes, setThemes] = useState([]);
    const [themeParts, setThemeParts] = useState([])
    const [theme, setTheme] = useState()

    useEffect(() => {
        const fetchThemes = async () => {
            try {
                const response = await axios.get(`${SERVER}/themes/getThemes`);
                if (response.status === 200) {
                    setThemes(response.data.themes);
                }
            } catch (err) {
                console.log(err);
            }
        };

        const fetchThemeParts = async () =>{
            try {
                const response = await axios.get(`${SERVER}/themeParts/getAllThemeParts`);
                if (response.status === 200) {
                    setThemeParts(response.data.themeParts);
                }
            } catch (err) {
                console.log(err);
            }
        }

        fetchThemes();
        fetchThemeParts();
    }, []);

    const handleCardClick = (theme) =>{
        setTheme(theme)
    }

    return (
        <Layout>
            {theme ? (
                <ThemeParts theme={theme} />
            ) : (
                <div className="cours">
                    <h1>Explorer Les Thèmes</h1>
                    <span>
                        Découvrez une collection de cours inspirants et de ressources enrichissantes pour cultiver une vie épanouie
                    </span>
                    <div className="theme-container">
                        {themes.length > 0 ? (
                            themes.map((theme) => (
                                <div key={theme.id} className="theme-card" onClick={themeParts.filter((themePart) => themePart.themeID === theme.id).length > 0 ? () => handleCardClick(theme) : null}>
                                    <div className="image-flip-container">
                                        <div className="image-flip">
                                            <div className="card-front">
                                                <img src={`${SERVER}${theme.image}`} alt={theme.title} />
                                            </div>
                                            <div className="card-back">
                                                {themeParts.filter((themePart) => themePart.themeID === theme.id).length > 0 ?(
                                                    <ol className="themeParts">
                                                        {themeParts.filter((themePart) => themePart.themeID === theme.id).map(themePart =>(
                                                                <li> {themePart.title} </li>
                                                        ))}
                                                    </ol>
                                                ) : (<div> Cette partie n'est pas disponible pour le moment </div>) }
                                            </div>
                                        </div>
                                    </div>
                                    <h3>{theme.title}</h3>
                                    <p>{theme.description}</p>
                                </div>
                            ))
                        ) : (
                            <p>No themes available</p>
                        )}
                    </div>
                </div>
            )}
            
        </Layout>
    );
};

export default Cours;
