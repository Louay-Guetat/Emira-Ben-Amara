import '../scss/pages/Home.scss'
import Layout from '../Layouts/Layout'
import { useNavigate } from 'react-router-dom'

const Home = () =>{
    const navigate = useNavigate()
    const handleBuying = () =>{
        navigate('/courses')
    }

    return(
        <Layout>
            <div className="home">
                <div className='banner'>
                    <div className='description'>
                        <h1>Renforcer votre bien-être intérieur</h1>
                        <span> Développez votre potentiel et atteignez vos objectifs avec l'aide d'un coach de vie expérimenté. </span>
                        <button onClick={handleBuying}> 
                            Acheter maintenant 
                            <svg width="48" height="24" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd"> <path d="M42.883 12l-4.527 6.235.644.765 7-7.521-7-7.479-.645.764 4.529 6.236h-37.884v1h37.883z"/></svg>
                        </button>
                    </div>
                    <div className='signature'> Emira Ben Amara </div>
                </div>
            </div>
        </Layout>
        
    )
}

export default Home;