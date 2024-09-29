import '../../scss/pages/admin/BlogsAdmin.scss'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { SERVER } from '../../config/config'
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
import BlogSections from './BlogSections';

const BlogsAdmin = () => {
    const [blogs, setBlogs] = useState([]);
    const [form, setForm] = useState()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [image, setImage] = useState('');
    const [selectedImage, setSelectedImage] = useState(''); 
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [id, setID] = useState()

    const [showSections, setShowSections] = useState(false)

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
        const fetchBlogs = async () => {
            try {
                const response = await axios.get(`${SERVER}/blogs/getBlogs`);
                if (response.status === 200) {
                    setBlogs(response.data.blogs);
                }
            } catch (err) {
                console.log(err);
            }
        };

        fetchBlogs();
    }, []);

    const openForm = () =>{
        setTitle('')
        setDescription('')
        setID('')
        setImage('')
        setForm(true)
        setShowSections(false)
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
                const response = await axios.put(`${SERVER}/blogs/updateBlog`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (response.status === 200){
                    setBlogs((prevBlogs) =>
                        prevBlogs.map((blog) =>
                            blog.id === id ? response.data.blog : blog
                        )
                    );
                    setForm(false); 
                }
            }else{
                const response = await axios.post(`${SERVER}/blogs/addBlog`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                if (response.status === 200) {
                    console.log(response.data)
                    setBlogs([...blogs, response.data.blog]);
                    setTitle('')
                    setDescription('')
                    setSelectedImage('')
                    setImage('')
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

    const handleBlogClick = (blog) =>{
        setDescription(blog.description)
        setTitle(blog.title)
        setForm(true)
        setEditing(true)
        setID(blog.id)
        setShowSections(true)
        window.scrollTo({
            top: document.body.scrollHeight,  
            behavior: 'smooth'                
        });
    }

    return (
        <AdminLayout>
            <div className="blogs">
                <div className='blogs-table'>
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
                                {blogs.length > 0 ? (
                                    blogs.map((blog) => (
                                        <StyledTableRow key={blog.id} onClick={() => handleBlogClick(blog)}>
                                            <StyledTableCell align="center">
                                                {blog.title}
                                            </StyledTableCell>
                                            <StyledTableCell align="center">{blog.description}</StyledTableCell>
                                            <StyledTableCell align="center">
                                                <img src={`${SERVER}${blog.image}`} alt={blog.title} style={{ height: '50px' }}
                                                     onClick={(e) => handleImageClick(e, `${SERVER}${blog.image}`)}
                                                 />
                                            </StyledTableCell>
                                            <StyledTableCell align="center">{new Date(blog.created_at).toLocaleString('fr-FR', {
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
                                            Il n'existe aucun blog <button onClick={openForm} className='add-blog-button'> Ajouter un Blog </button>
                                        </StyledTableCell>
                                    </StyledTableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {blogs.length > 0 && (<button onClick={openForm} className='add-blog-button'> Ajouter un Blog </button>)}
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
                                    placeholder="Enter the Blog title"
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
                                    placeholder="Enter the Blog description"
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
                                        setShowSections(false);
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

            {showSections && <BlogSections blogID={id} blogTitle={title} />}
        </AdminLayout>
    );
}

export default BlogsAdmin;