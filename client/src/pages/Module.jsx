import { useEffect, useState } from 'react';
import '../scss/pages/Module.scss'
import axios from 'axios';
import { SERVER } from '../config/config';

const Module = ({theme, themePart}) =>{
    const [modules, setModules] = useState([])
    console.log(themePart)
    useEffect(() =>{
        const fetchModules = async () =>{
            try {
                const themePartID = themePart.id
                const response = await axios.get(`${SERVER}/modules/getModules`, {
                  params: { themePartID },
                });
                if (response.status === 200) {
                  setModules(response.data.modules);
                }
              } catch (err) {
                console.log(err);
              }
        }

        if (themePart) {
            fetchModules();
        }
    }, [])

    return(
        <div className="modules">
            <h1> {theme.title} </h1>
            <span> {theme.description} </span>
            <ol> <li> {themePart.title} </li> </ol>
            {modules.length > 0 && 
            modules.map((module)=>(
                <div className='module'>
                    <video src={module.video} controls/>
                    <button className='download'> Télécharger des ressources </button>
                </div>
            ))}
        </div>
    )
}

export default Module;