import { useEffect, useState } from "react";
import Layout from "../Layouts/Layout";
import '../scss/pages/Cours.scss';
import axios from 'axios';
import { SERVER } from '../config/config';

const Cours = () => {
    const [themes, setThemes] = useState([]);

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

        fetchThemes();
    }, []);

    return (
        <Layout>
            <div className="cours">
                <h1>Explorer Les Thèmes</h1>
                <span>
                    Découvrez une collection de cours inspirants et de ressources enrichissantes pour cultiver une vie épanouie
                </span>
                <div className="theme-container">
                    {themes.length > 0 ? (
                        themes.map((theme) => (
                            <div key={theme.id} className="theme-card">
                                <div className="image-flip-container">
                                    <div className="image-flip">
                                        <div className="card-front">
                                            <img src={`${SERVER}${theme.image}`} alt={theme.title} />
                                        </div>
                                        <div className="card-back">
                                            <span>{theme.description}</span>
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
        </Layout>
    );
};

export default Cours;
