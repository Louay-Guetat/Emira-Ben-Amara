import React, { useState, useEffect } from "react";
import axios from "axios";
import { SERVER } from "../../config/config";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import ImageModal from "../../components/ImageModal";

const BlogSections = ({ blogID, blogTitle }) => {
  const [blogSections, setBlogSections] = useState([]);
  const [form, setForm] = useState(false);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(''); // State to manage selected image
  const [modalOpen, setModalOpen] = useState(false); // State to manage modal visibility
  const [editing, setEditing] = useState(false);
  const [id, setID] = useState()

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
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    "&:last-child td, &:last-child th": {
      border: 0,
    },
    "&:hover": {
      cursor: "pointer",
      backgroundColor: "#a78262",
    },
  }));

  useEffect(() => {
    const fetchBlogSections = async () => {
      try {
        const response = await axios.get(`${SERVER}/blogs/getBlogSections`, {
          params: { blogID },
        });
        if (response.status === 200) {
          setBlogSections(response.data.blogSections);
        }
      } catch (err) {
        console.log(err);
      }
    };

    if (blogID) {
      fetchBlogSections();
    }
  }, [blogID]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("blogID", blogID);
    formData.append("text", text);
    if (image) formData.append("image", image);

    try {
      if (editing){
        formData.append('id', id);
        const response = await axios.put(`${SERVER}/blogs/updateBlogSection`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.status === 200){
            setBlogSections((prevBlogSections) =>
                prevBlogSections.map((blogSection) =>
                    blogSection.id === id ? response.data.blogSection : blogSection
                )
            );
            setForm(false); 
        }
    }else{
      const response = await axios.post(`${SERVER}/blogs/addBlogSection`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 200) {
        setBlogSections([...blogSections, response.data.blogSection]);
        resetForm();
      }
    }
    } catch (err) {
      console.log(err);
    }
  };

  const openForm = () =>{
    setText('')
    setID('')
    setImage('')
    setForm(true)
}

  const resetForm = () => {
    setText("");
    setImage(null);
    setForm(false);
    setEditing(false);
  };

  const handleBlogSectionClick = (blogSection) =>{
        setText(blogSection.text)
        setForm(true)
        setEditing(true)
        setID(blogSection.id)
  }

  const handleImageClick = (event, imageSrc) => {
    event.stopPropagation()
    setSelectedImage(imageSrc);
    setModalOpen(true);
};

const handleModalClose = () => {
  setModalOpen(false);
  setSelectedImage('');
};

  return (
    <>
      <div className="blogSections">
        <div className="blogSections-table">
          <h1> Les Sections de <br></br><span style={{color:'black'}}>{blogTitle}</span> </h1>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 640 }} aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell align="center">Text</StyledTableCell>
                  <StyledTableCell align="center">Image</StyledTableCell>
                  <StyledTableCell align="center">Date de Creation</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {blogSections.length > 0 ? (
                  blogSections.map((blogSection) => (
                    <StyledTableRow key={blogSection.id} onClick={() => handleBlogSectionClick(blogSection)}>
                      <StyledTableCell align="center">{blogSection.text}</StyledTableCell>
                      <StyledTableCell align="center">
                        <img
                          src={`${SERVER}${blogSection.image}`}
                          alt={blogTitle}
                          style={{ height: "50px" }}
                          onClick={(e) => handleImageClick(e, `${SERVER}${blogSection.image}`)}
                        />
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {new Date(blogSection.created_at).toLocaleString("fr-FR", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </StyledTableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <StyledTableRow>
                    <StyledTableCell colSpan={4} align="center">
                      Il n'existe aucune partie pour le Blog <strong>{blogTitle}</strong>{" "}
                      <button onClick={openForm} className="add-blogSection-button">
                        Ajouter une partie
                      </button>
                    </StyledTableCell>
                  </StyledTableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {blogSections.length > 0 && (
            <button onClick={openForm} className="add-blogSection-button">
              Ajouter une Section
            </button>
          )}
        </div>
        {form && (
          <div className="add-form">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="description">Text</label>
                <textarea
                  id="text"
                  name="text"
                  placeholder="Enter le text de cette section"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
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
                  required={!editing}
                />
              </div>

              <div className="form-actions">
                <button type="submit">{editing ? "Modifier" : "Ajouter"}</button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                  }}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        )}
        <ImageModal
            open={modalOpen}
            onClose={handleModalClose}
            imageSrc={selectedImage}
        />
      </div>
    </>
  );
};

export default BlogSections;
