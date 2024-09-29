import '../scss/components/Footer.scss'
import facebook from '../utils/icons/facebook.png';
import instagram from '../utils/icons/instagram.png';
import whatsapp from '../utils/icons/whatsapp.png';
import linkedin from '../utils/icons/linkedin.png';
import gmail from '../utils/icons/gmail.png';

const Footer = () =>{

    const scrollToTemoignage = () => {
        const temoignageSection = document.getElementById('temoignage');
        if (temoignageSection) {
            temoignageSection.scrollIntoView({ behavior: 'smooth' });
        }
    };
    
    return(
        <div className='questions'>
            <h1> Questions Fréquemment Posées </h1>
            <ul>  
                <li> "Quels sont les avantages des cours d’Emira ?" </li>
                <li> "Comment se déroulent les séances de coaching ?" </li>
                <li> "Puis-je accéder aux cours à tout moment ?" </li>
                <li> "Qu’est-ce qui rend les cours d’Emira uniques ?" </li>
            </ul>
            <span> Vous avez d’autres questions ? Contactez-nous ici </span>
            <footer> 
                <a href='/aboutus'> À propos </a>
                <a onClick={scrollToTemoignage}> Témoignages </a> {/* Update this link */}
                <a href=''> FAQ </a>
                <a href='/contact'> Contact </a>
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
            </footer>
            <div className='copyright'> Copyright © 2024 WE TEKUP. Tous droits réservés. </div>
        </div>
    )
}

export default Footer;