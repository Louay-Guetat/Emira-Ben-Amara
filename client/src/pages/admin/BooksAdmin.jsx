import { useState } from "react";
import AdminLayout from "../../Layouts/AdminLayout";
import '../../scss/pages/admin/BooksAdmin.scss';
import { SERVER } from "../../config/config";
import axios from "axios";

const BooksAdmin = () => {
    const [title, setTitle] = useState();
    const [description, setDescription] = useState();
    const [image, setImage] = useState();
    const [book, setBook] = useState();
    const [bookPreview, setBookPreview] = useState();
    const [price, setPrice] = useState();
    const [editing, setEditing] = useState('Ajouter');

    const resetForm = () =>{
        setTitle('')
        setDescription('')
        setPrice('')
        setImage('')
        setBook('')
        setBookPreview('')
    }


    const submitForm = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', title);
        
        formData.append('price', price);
        if (image) formData.append('image', image);
        if (description) formData.append('description', description);
        if (book) formData.append('book', book);
        if (bookPreview) formData.append('book_preview', bookPreview);

        try {
            const response = await axios.post(`${SERVER}/books/addBook`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                // Handle successful form submission
                alert('Book added successfully!');
                resetForm()
            } else {
                // Handle error in form submission
                alert(`Error: ${response.data.error}`);
            }
        } catch (error) {
            // Handle axios errors
            alert(`Error: ${error.response?.data?.error || error.message}`);
        }
    };

    return (
        <AdminLayout>
            <div className="books-admin">
                <form onSubmit={submitForm}>
                    <div className="text-inputs">
                        <div className="form-group">
                            <label> Titre </label>
                            <input
                                type="text"
                                placeholder="Donner le titre du Livre"
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label> Prix </label>
                            <input
                                type="text"
                                placeholder="Donner le prix du Livre"
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="text-inputs">
                        <div className="form-group">
                            <label> Image du Livre </label>
                            <input
                                type="file"
                                onChange={(e) => setImage(e.target.files[0])}
                                accept="image/*"
                            />
                        </div>
                        <div className="form-group">
                            <label> Image du dos du livre </label>
                            <input
                                type="file"
                                onChange={(e) => setDescription(e.target.files[0])}
                                accept="image/*"
                            />
                        </div>
                    </div>
                    <div className="text-inputs">
                        <div className="form-group">
                            <label> Le Livre </label>
                            <input
                                type="file"
                                onChange={(e) => setBook(e.target.files[0])}
                                accept=".pdf"
                            />
                        </div>
                        <div className="form-group">
                            <label> Extrait du Livre </label>
                            <input
                                type="file"
                                onChange={(e) => setBookPreview(e.target.files[0])}
                                accept=".pdf"
                            />
                        </div>
                    </div>

                    <button type="submit"> {editing} </button>
                </form>
            </div>
        </AdminLayout>
    );
};

export default BooksAdmin;
