import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

import ImageModel from '../../components/ImageModal'
import AdminLayout from "../../Layouts/AdminLayout";
import '../../scss/pages/admin/Themes.scss'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { SERVER } from '../../config/config'
import ThemeParts from './ThemeParts';

const Themes = () => {
    const [themes, setThemes] = useState([]);
    const [form, setForm] = useState()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [image, setImage] = useState('');
    const [selectedImage, setSelectedImage] = useState(''); 
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [id, setID] = useState()

    const [showThemePart, setShowThemeParts] = useState(false)

    const StyledTableCell = styled(TableCell)(({ theme }) => ({
        [`&.${tableCellClasses.head}`]: {
            backgroundColor: theme.palette.common.black,
            color: theme.palette.common.white,
        },
        [`&.${tableCellClasses.body}`]: {
            fontSize: 14,
        },
    }));

    const StyledTableRow = styled(TableRow)(({ theme }) => ({
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
        // hide last border
        '&:last-child td, &:last-child th': {
            border: 0,
        },
        '&:hover': {
            cursor: 'pointer',
            backgroundColor: '#a78262',
        }
    }));

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

    const openForm = () =>{
        setTitle('')
        setDescription('')
        setID('')
        setImage('')
        setForm(true)
        setShowThemeParts(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); 
    
        const formData = new FormData();
        formData.append('title', title); 
        formData.append('description', description);
        if (image) {
            formData.append('image', image);
        }

        try {
            if (editing){
                formData.append('id', id);
                const response = await axios.put(`${SERVER}/themes/updateTheme`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (response.status === 200){
                    setThemes((prevThemes) =>
                        prevThemes.map((theme) =>
                            theme.id === id ? response.data.theme : theme
                        )
                    );
                    setForm(false); 
                }
            }else{
                const response = await axios.post(`${SERVER}/themes/addTheme`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                if (response.status === 200) {
                    console.log(response.data)
                    setThemes([...themes, response.data.theme]);
                }
            }
            
        } catch (err) {
            console.log(err); // Log any errors
        }
    };    

    const handleImageClick = (event, imageSrc) => {
        event.stopPropagation()
        setSelectedImage(imageSrc);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setSelectedImage('');
    };

    const handleThemeClick = (theme) =>{
        setDescription(theme.description)
        setTitle(theme.title)
        setForm(true)
        setEditing(true)
        setID(theme.id)
        setShowThemeParts(true)
    }

    return (
        <AdminLayout>
            <div className="themes">
                <div className='themes-table'>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 640 }} aria-label="customized table">
                            <TableHead>
                                <TableRow>
                                    <StyledTableCell align="center">Titre</StyledTableCell>
                                    <StyledTableCell align="center">Description</StyledTableCell>
                                    <StyledTableCell align="center">Image</StyledTableCell>
                                    <StyledTableCell align="center">Date de Creation</StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {themes.length > 0 ? (
                                    themes.map((theme) => (
                                        <StyledTableRow key={theme.id} onClick={() => handleThemeClick(theme)}>
                                            <StyledTableCell align="center">
                                                {theme.title}
                                            </StyledTableCell>
                                            <StyledTableCell align="center">{theme.description}</StyledTableCell>
                                            <StyledTableCell align="center">
                                                <img src={`${SERVER}${theme.image}`} alt={theme.title} style={{ height: '50px' }}
                                                     onClick={(e) => handleImageClick(e, `${SERVER}${theme.image}`)}
                                                 />
                                            </StyledTableCell>
                                            <StyledTableCell align="center">{new Date(theme.created_at).toLocaleString('fr-FR', {
                                                                                                            weekday: 'long',
                                                                                                            year: 'numeric',
                                                                                                            month: 'long',
                                                                                                            day: 'numeric',
                                                                                                            hour: '2-digit',
                                                                                                            minute: '2-digit',
                                                                                                            hour12: false 
                                                                                                        })}
                                            </StyledTableCell>
                                        </StyledTableRow>
                                    ))
                                ) : (
                                    <StyledTableRow>
                                        <StyledTableCell colSpan={4} align="center">
                                            Il n'existe aucun théme <button onClick={openForm} className='add-theme-button'> Ajouter un Théme </button>
                                        </StyledTableCell>
                                    </StyledTableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {themes.length > 0 && (<button onClick={openForm} className='add-theme-button'> Ajouter un Théme </button>)}
                </div>

                {form && (
                    <div className='add-form'>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="title">Titre</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    placeholder="Enter the theme title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="Enter the theme description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label htmlFor="image">Image</label>
                                <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    onChange={(e) => setImage(e.target.files[0])}
                                    required= {!editing}
                                />
                            </div>

                            <div className="form-actions">
                                <button type="submit"> {editing ? 'Modifier' : 'Ajouter'} </button>
                                <button onClick={() => {
                                        setShowThemeParts(false);
                                        setForm(false)
                                    }}
                                > 
                                    Close 
                                </button>

                            </div>
                        </form>
                    </div>
                )}
            </div>
            <ImageModel
                open={modalOpen}
                onClose={handleModalClose}
                imageSrc={selectedImage}
            />

            {showThemePart && <ThemeParts themeID={id} themeTitle={title} />}
        </AdminLayout>
    );
};

export default Themes;
