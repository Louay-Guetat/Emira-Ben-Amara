import axios from "axios";
import { useEffect, useState } from "react";
import { SERVER } from "../config/config";
import '../scss/pages/Blogs.scss'
import facebook from '../utils/icons/facebook.png';
import instagram from '../utils/icons/instagram.png';
import whatsapp from '../utils/icons/whatsapp.png';
import linkedin from '../utils/icons/linkedin.png';
import gmail from '../utils/icons/gmail.png';
import useUser from "../hooks/useUser";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import Blogs from "./Blogs";

const Blog = ({blog, formatDate}) =>{
    console.log(blog)
    const [blogSections, setBlogSections] = useState([])
    const {user, loading } = useUser()
    const [back, setBack] = useState(false)
    
    useEffect(() =>{
        const fetchBlogSections = async () =>{
            try{
                const blogID = blog.id
                const response = await axios.get(`${SERVER}/blogs/getBlogSections`, {
                    params: { blogID }
                })

                if (response.status === 200){
                    setBlogSections(response.data.blogSections)
                }
            }catch(error){
                console.log(error)
            }
        }

        const updateBlogViews = async () =>{
            try{
                const response = await axios.put(`${SERVER}/blogs/updateBlogViews`, {blogID : blog.id})
                if(response.status === 200){
                    blog.views = response.data.views
                }
            }catch(err){
                console.log(err)
            }
        }

        if(blog){
            fetchBlogSections()
            updateBlogViews()
        }
    },[blog])

    if (back === true){
        return <Blogs />
    }else{
        return(
            <div className="blog">
                <div className="div-wallpaper"></div>
                <div className="headers">
                    <button id="goBack" onClick={() => setBack(true)}> <FontAwesomeIcon icon={faChevronLeft} size="2xl" color="black" /> </button>
                    <p> {formatDate(blog.created_at)} </p>
                    <h1> {blog.title} </h1>
                    <hr></hr>
                </div>
                {blogSections.length >0 ? (
                    <div className="content">
                        {blogSections.map((section, index) => (
                            <div key={index} className={`section`}>
                                {index % 2 === 0 ? (
                                    <>
                                        <div className="text">
                                            <div>{section.text.split('\n').map((paragraph, index) => (
                                                <p key={index}>{paragraph}</p>
                                            ))}</div>
                                        </div>
                                        <div className="image">
                                            <img src={`${SERVER}${section.image}`} alt={section.blog_id} />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="image">
                                            <img src={`${SERVER}${section.image}`} alt={section.blog_id} />
                                        </div>
                                        <div className="text">
                                            <div>{section.text.split('\n').map((paragraph, index) => (
                                                <p key={index}>{paragraph}</p>
                                            ))}</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="content-not-found"> there is no content here </div>
                )}

                <div className="signature">
                    <span> Emira Ben Amara <br></br> Votre Accompagnatrice vers la réalisation de soi  </span>
                    <span id="views"> {blog.views} vues </span>
                </div>
                <div className="share">
                    Partager l'article sur:
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
        )
    }
}

export default Blog;