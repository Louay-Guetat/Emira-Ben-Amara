import '../scss/pages/Blog.scss';
import Layout from '../Layouts/Layout';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLockOpen, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { SERVER } from '../config/config';
import Blog from './Blog';

const Blogs = ({ blogItem }) => {
    console.log(blogItem)
    const [searchText, setSearchText] = useState('');
    const [blogs, setBlogs] = useState([]);
    const [blog, setBlog] = useState(blogItem);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get(`${SERVER}/blogs/getBlogs`);
                if (response.status === 200) {
                    setBlogs(response.data.blogs);
                }
            } catch (e) {
                console.log(e);
            }
        };
        fetchBlogs();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(date);
    };

    const filteredBlogs = blogs.filter((blog) =>
        blog.title.toLowerCase().includes(searchText.toLowerCase()) ||
        blog.description.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <Layout>
            {blog ? (
                <Blog blog={blog} formatDate = {formatDate} />
            ) : (
                <div className="Blogs">
                    <div className="div-wallpaper"></div>
                    <div className="main-blogs">
                        <h1> Les Articles Inspirants d'Emira </h1>
                        <label> Rechercher par mot-clé </label>
                        <div className="form-group">
                            <input
                                type="text"
                                onChange={(e) => setSearchText(e.target.value)}
                                className="search-input"
                            />
                            <FontAwesomeIcon
                                icon={faMagnifyingGlass}
                                color="black"
                                size="lg"
                                className="search-icon"
                            />
                        </div>
                        <div className="blogs-container">
                            <div className="filters">
                                <div className="categories">
                                    <h3> Categories </h3>
                                    <hr />
                                    <div className="categories-container">
                                        <div className="category"> Développement personnel </div>
                                        <div className="category"> Bien etre </div>
                                        <div className="category"> Coaching de vie </div>
                                    </div>
                                </div>
                                <div className="orderbys">
                                    <h3> Trier Par </h3>
                                    <hr />
                                    <div className="orderby-container">
                                        <div className="orderby"> Date </div>
                                        <div className="orderby"> Popularité </div>
                                    </div>
                                </div>
                            </div>
                            <div className="blogs-elements">
                                {filteredBlogs.length > 0 ? (
                                    filteredBlogs.map((blog) => (
                                        <div className="blog" key={blog.id}>
                                            <div className="image">
                                                <img src={`${SERVER}${blog.image}`} alt="blog" />
                                            </div>
                                            <div className="details">
                                                <p> {formatDate(blog.created_at)} </p>
                                                <h2> {blog.title} </h2>
                                                <hr />
                                                <span> {blog.description} </span>
                                                <button onClick={() => setBlog(blog)}> En savoir plus </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="blog-not-found">
                                        Il n'ya aucun blog pour le moment
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Blogs;
