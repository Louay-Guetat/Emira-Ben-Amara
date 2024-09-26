import { useEffect, useState } from 'react';
import '../scss/pages/Module.scss'
import axios from 'axios';
import { SERVER } from '../config/config';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import Layout from '../Layouts/Layout';
import ThemeParts from './ThemeParts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons';

const Module = ({theme, themePart}) =>{
    const [modules, setModules] = useState([])
    const [themePa, setThemePa] = useState()

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

    const handleDownload = async (module) => {
        const zip = new JSZip();
        
        try {
            const ebookResponse = await fetch(module.ebook);
            const ebookBlob = await ebookResponse.blob();
            
            const assessmentsResponse = await fetch(module.assessments);
            const assessmentsBlob = await assessmentsResponse.blob();
            
            zip.file('ebook.pdf', ebookBlob); 
            zip.file('assessments.pdf', assessmentsBlob);
            
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            saveAs(zipBlob, `${module.title}_resources.zip`);
        } catch (error) {
            console.error('Error downloading resources:', error);
        }
    };

    return(
        <Layout>
            { themePa ? (<ThemeParts theme={theme} />) : (
                <div className="modules">
                    <button id='go-back' onClick={() => setThemePa(themePart)}> <FontAwesomeIcon icon={faCaretLeft} size='2xl' color='white' /> </button>
                    <h1> {theme.title} </h1>
                    <span> {theme.description} </span>
                    <ol> <li> {themePart.title} </li> </ol>
                    {modules.length > 0 && 
                    modules.map((module)=>(
                        <div className='module'>
                            <video src={module.video} controls/>
                            <button className='download' onClick={() => handleDownload(module)}> Télécharger des ressources </button>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    )
}

export default Module;