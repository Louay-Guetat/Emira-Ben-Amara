import Layout from "../Layouts/Layout";
import '../scss/pages/Cours.scss';
import cours1 from '../utils/cours1.jpeg';
import cours2 from '../utils/cours2.jpeg';
import cours3 from '../utils/cours3.jpeg';

const Cours = () => {
    return (
        <Layout>
            <div className="cours">
                <h1> Explorer Les thémes </h1>
                <span> Découvrer une collection des cours inspirants et 
                       de ressources enrichissantes pour cultiver une vie 
                       épanouie
                </span>
                <div className="theme-container">
                    <div className="theme-card">
                        <div className="image-flip-container">
                            <div className="image-flip">
                                <div className="card-front">
                                    <img src={cours1} alt="Confiance en soi" />
                                </div>
                                <div className="card-back">
                                    <span> Apprenez à cultiver une confiance durable.</span>
                                </div>
                            </div>
                        </div>
                        <h3>Confiance en soi</h3>
                        <p>Développez une confiance en vous inébranlable et atteignez vos objectifs personnels et professionnels.</p>
                    </div>

                    <div className="theme-card">
                        <div className="image-flip-container">
                            <div className="image-flip">
                                <div className="card-front">
                                    <img src={cours2} alt="Gestion du stress" />
                                </div>
                                <div className="card-back">
                                    <span> Techniques de relaxation et méditation.</span>
                                </div>
                            </div>
                        </div>
                        <h3>Gestion du stress</h3>
                        <p>Apprenez des techniques efficaces pour gérer le stress au quotidien et retrouvez l'équilibre intérieur.</p>
                    </div>

                    <div className="theme-card">
                        <div className="image-flip-container">
                            <div className="image-flip">
                                <div className="card-front">
                                    <img src={cours3} alt="équilibre vie-travail" />
                                </div>
                                <div className="card-back">
                                    <span>Gestion du temps et des priorités.</span>
                                </div>
                            </div>
                        </div>
                        <h3>Équilibre vie-travail</h3>
                        <p>Trouvez l'harmonie entre votre vie personnelle et professionnelle pour un bien-être global.</p>
                    </div>
                    <div className="theme-card">
                        <div className="image-flip-container">
                            <div className="image-flip">
                                <div className="card-front">
                                    <img src={cours3} alt="équilibre vie-travail" />
                                </div>
                                <div className="card-back">
                                    <span>Gestion du temps et des priorités.</span>
                                </div>
                            </div>
                        </div>
                        <h3>Équilibre vie-travail</h3>
                        <p>Trouvez l'harmonie entre votre vie personnelle et professionnelle pour un bien-être global.</p>
                    </div>
                    
                </div>
            </div>
        </Layout>
    );
}

export default Cours;
