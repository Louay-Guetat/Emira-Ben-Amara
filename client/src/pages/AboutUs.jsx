import Layout from '../Layouts/Layout';
import '../scss/pages/Aboutus.scss'
import image1 from '../utils/aboutus/1.png'
import image2 from '../utils/aboutus/2.png'
import image3 from '../utils/aboutus/3.png'
import facebook from '../utils/icons/facebook.png';
import instagram from '../utils/icons/instagram.png';
import whatsapp from '../utils/icons/whatsapp.png';
import linkedin from '../utils/icons/linkedin.png';
import gmail from '../utils/icons/gmail.png';

const AboutUs = () =>{
    return(
        <Layout>
            <div className="AboutUs">
                <div className='div-wallpaper'></div>
                <div className='main-container'>
                    <div className='images-group'> 
                        <img src={image1} alt='first image' />
                        <img src={image2} alt='second image' />
                        <img src={image3} alt='third image' />
                    </div>
                    <div className='informations-group'>
                        <h1> À propos d'Emira </h1>
                        <span> Je m'appelle Emira, Facilitatrice et accompagnatrice de croissance intérieure ainsi qu’accompagnatrice professionnelle. Depuis plus de 15 ans, je m'engage à soutenir des personnes dans leur réalisation personnelle, que ce soit dans leur vie privée, professionnelle, leur confiance en soi ou leur épanouissement personnel au sens large. </span>
                        <h3> Mon Parcours : </h3>
                        <span> Mon chemin vers le coaching a été façonné par des rencontres marquantes avec des femmes inspirantes et des experts en bien-être. Ces rencontres ont nourri mon désir de me consacrer pleinement à ce métier. Des événements significatifs, tant dans ma vie personnelle que professionnelle, ont renforcé cette vocation. </span>
                        <h3> Certifications et Compétences : </h3>
                        <span> 
                            En parallèle de mon expérience, j'ai obtenu plusieurs certifications reconnues :
                            <ul>
                                <li> Coaching personnel et professionnel auprès de la Haute École de Coaching de Paris. </li>
                                <li> PNL (Programmation Neuro-Linguistique). </li>
                                <li> Psychologie positive. </li>
                            </ul>
                            Mes compétences sont également enrichies par mes connaissances en :
                            <ul>
                                <li> Physique quantique, </li>
                                <li> Neurosciences, </li>
                                <li> Thérapie cognitive et comportementale. </li>
                            </ul>
                            Ces outils puissants sont intégrés dans mes accompagnements pour vous offrir un soutien complet en développement personnel.
                        </span>
                        <h3> Mes Événements et Formations : </h3>
                        <span> 
                            Au fil des années, j'ai eu l'opportunité de partager mon expertise à travers divers événements et formations :
                            <ul>
                                <li> Participation au Salon Ryada 2021. </li>
                                <li> Formation avec Tunivision, axée sur le développement personnel. </li>
                                <li> Participation à l'événement "Femmes", dédié à l'accompagnement des femmes vers leur épanouissement. </li>
                                <li> Formation pour les étudiants de l’ESAT University (Entrepreneurs 2023), où j'ai encadré de jeunes entrepreneurs dans leur parcours. </li>
                                <li> Le Cercle des Démi(e)s, un cercle de bien-être que j'organise avec une autre professionnelle, offrant un espace d’échange et de soutien. </li>
                            </ul>
                        </span>
                        <h3> Ma Philosophie : </h3>
                        <span> Je crois fermement que chaque individu possède en lui les clés pour atteindre ses objectifs. Mon rôle est de vous guider pour prendre conscience de vos ressources intérieures et faire des choix alignés avec vos aspirations profondes.
                        Choisir, c’est s’offrir la liberté d’être soi-même, devenir autonome et transformer ses rêves en réalité. </span>
                        <h3> Un Accompagnement Sur Mesure : </h3>
                        <span> Je vous propose un accompagnement personnalisé, adapté à vos besoins spécifiques. Ensemble, nous travaillerons pour que vous puissiez vous réaliser pleinement et vivre la vie que vous désirez. </span>
                        
                        <div className='about-contact'>
                            <span> Pour en savoir plus sur mes accompagnements ou pour réserver une séance, n'hésitez pas à me contacter. </span>
                            <div className='social-media'> 
                                <i>
                                    <img src={instagram} alt="Instagram" />
                                </i>
                                <i>
                                    <img src={facebook} alt="Facebook" />
                                </i>
                                <i>
                                    <img src={linkedin} alt="Linkedin" />
                                </i>
                                <i>
                                    <img src={gmail} alt="Gmail" />
                                </i>
                                <i>
                                    <img src={whatsapp} alt="Whatsapp" />
                                </i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='mobile-about-us'>
                <div className='div-wallpaper'></div>
                <div className='main-container'>
                    <h1> À propos d'Emira </h1>
                    <img src={image1} alt='first image' />
                    <span> Je m'appelle Emira, Facilitatrice et accompagnatrice de croissance intérieure ainsi qu’accompagnatrice professionnelle. Depuis plus de 15 ans, je m'engage à soutenir des personnes dans leur réalisation personnelle, que ce soit dans leur vie privée, professionnelle, leur confiance en soi ou leur épanouissement personnel au sens large. </span>
                    <h3> Mon Parcours : </h3>
                    <span> Mon chemin vers le coaching a été façonné par des rencontres marquantes avec des femmes inspirantes et des experts en bien-être. Ces rencontres ont nourri mon désir de me consacrer pleinement à ce métier. Des événements significatifs, tant dans ma vie personnelle que professionnelle, ont renforcé cette vocation. </span>
                    <h3> Certifications et Compétences : </h3>
                    <img src={image2} alt='second image' />
                    <span> 
                        En parallèle de mon expérience, j'ai obtenu plusieurs certifications reconnues :
                        <ul>
                            <li> Coaching personnel et professionnel auprès de la Haute École de Coaching de Paris. </li>
                            <li> PNL (Programmation Neuro-Linguistique). </li>
                            <li> Psychologie positive. </li>
                        </ul>
                        Mes compétences sont également enrichies par mes connaissances en :
                        <ul>
                            <li> Physique quantique, </li>
                            <li> Neurosciences, </li>
                            <li> Thérapie cognitive et comportementale. </li>
                        </ul>
                        Ces outils puissants sont intégrés dans mes accompagnements pour vous offrir un soutien complet en développement personnel.
                    </span>
                    <h3> Mes Événements et Formations : </h3>
                    <span> 
                        Au fil des années, j'ai eu l'opportunité de partager mon expertise à travers divers événements et formations :
                        <ul>
                            <li> Participation au Salon Ryada 2021. </li>
                            <li> Formation avec Tunivision, axée sur le développement personnel. </li>
                            <li> Participation à l'événement "Femmes", dédié à l'accompagnement des femmes vers leur épanouissement. </li>
                            <li> Formation pour les étudiants de l’ESAT University (Entrepreneurs 2023), où j'ai encadré de jeunes entrepreneurs dans leur parcours. </li>
                            <li> Le Cercle des Démi(e)s, un cercle de bien-être que j'organise avec une autre professionnelle, offrant un espace d’échange et de soutien. </li>
                        </ul>
                    </span>
                    <h3> Ma Philosophie : </h3>
                    <img src={image3} alt='third image' />
                    <span> Je crois fermement que chaque individu possède en lui les clés pour atteindre ses objectifs. Mon rôle est de vous guider pour prendre conscience de vos ressources intérieures et faire des choix alignés avec vos aspirations profondes.
                    Choisir, c’est s’offrir la liberté d’être soi-même, devenir autonome et transformer ses rêves en réalité. </span>
                    <h3> Un Accompagnement Sur Mesure : </h3>
                    <span> Je vous propose un accompagnement personnalisé, adapté à vos besoins spécifiques. Ensemble, nous travaillerons pour que vous puissiez vous réaliser pleinement et vivre la vie que vous désirez. </span>
                    
                    <div className='about-contact'>
                        <span> Pour en savoir plus sur mes accompagnements ou pour réserver une séance, n'hésitez pas à me contacter. </span>
                        <div className='social-media'> 
                            <i>
                                <img src={instagram} alt="Instagram" />
                            </i>
                            <i>
                                <img src={facebook} alt="Facebook" />
                            </i>
                            <i>
                                <img src={linkedin} alt="Linkedin" />
                            </i>
                            <i>
                                <img src={gmail} alt="Gmail" />
                            </i>
                            <i>
                                <img src={whatsapp} alt="Whatsapp" />
                            </i>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default AboutUs;