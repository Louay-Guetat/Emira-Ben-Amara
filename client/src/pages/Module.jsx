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
import { faFilePdf } from '@fortawesome/free-regular-svg-icons';
import PDFModal from '../components/PDFModal';

const Module = ({theme, themePart}) =>{
    const [modules, setModules] = useState([])
    const [themePa, setThemePa] = useState()
    const [selectedPDF, setSelectedPDF] = useState('');
    const [pdfModalOpen, setPDFModalOpen] = useState(false);

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

    const disableRightClick = (e) => {
        e.preventDefault();
    };

    const handlePDFClick = (event, pdfSrc) => {
        event.stopPropagation();
        setSelectedPDF(pdfSrc);
        setPDFModalOpen(true);
    };

    return(
        <>
            { themePa ? (<ThemeParts theme={theme} />) : (
                <div className="modules">
                    <button id='go-back' onClick={() => setThemePa(themePart)}> <FontAwesomeIcon icon={faCaretLeft} size='2xl' color='white' /> </button>
                    <h1> {theme.title} </h1>
                    <span> {theme.description} </span>
                    <ol> <li> {themePart.title} </li> </ol>
                    {modules.length > 0 && 
                    modules.map((module)=>(
                        <div className='module' key={module.id}>
                            <video src={module.video} 
                                controls
                                disablePictureInPicture
                                controlsList="nodownload"  
                                onContextMenu={disableRightClick}        
                            />
                            <div className='Ressources'>
                                <div onClick={(e) => handlePDFClick(e, `${SERVER}${module.ebook}`)}>
                                    <span> E-Book </span>
                                    <FontAwesomeIcon icon={faFilePdf} />
                                </div>
                                <div onClick={(e) => handlePDFClick(e, `${SERVER}${module.assessments}`)}>
                                    <span> Assessments </span>
                                    <FontAwesomeIcon icon={faFilePdf} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <PDFModal
                open={pdfModalOpen}
                onClose={() => setPDFModalOpen(false)}
                pdfSrc={selectedPDF}
            />
        </>
    )
}

export default Module;