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
import Module from "./Module";

const ThemeParts = ({ themeID, themeTitle }) => {
  const [themeParts, setThemeParts] = useState([]);
  const [form, setForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(''); // State to manage selected image
  const [modalOpen, setModalOpen] = useState(false); // State to manage modal visibility
  const [editing, setEditing] = useState(false);
  const [id, setID] = useState()
  const [showSequences, setShowSequences] = useState(false)

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
    const fetchThemeParts = async () => {
      try {
        const response = await axios.get(`${SERVER}/themeParts/getThemeParts`, {
          params: { themeID },
        });
        if (response.status === 200) {
          setThemeParts(response.data.themeParts);
        }
      } catch (err) {
        console.log(err);
      }
    };

    if (themeID) {
      fetchThemeParts();
    }
  }, [themeID]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("themeID", themeID);
    formData.append("title", title);
    formData.append("description", description);
    if (image) formData.append("image", image);

    try {
      if (editing){
        formData.append('id', id);
        const response = await axios.put(`${SERVER}/themeParts/updateThemePart`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.status === 200){
            setThemeParts((prevThemeParts) =>
                prevThemeParts.map((themePart) =>
                  themePart.id === id ? response.data.themePart : themePart
                )
            );
            setForm(false); 
        }
    }else{
      const response = await axios.post(`${SERVER}/themeParts/addThemePart`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.status === 200) {
        setThemeParts([...themeParts, response.data.themePart]);
        resetForm();
      }
    }
    } catch (err) {
      console.log(err);
    }
  };

  const openForm = () =>{
    setTitle('')
    setDescription('')
    setID('')
    setImage('')
    setForm(true)
}

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImage(null);
    setForm(false);
    setEditing(false);
    setShowSequences(false)
  };

  const handleThemePartClick = (themePart) =>{
        setDescription(themePart.description)
        setTitle(themePart.title)
        setForm(true)
        setEditing(true)
        setID(themePart.id)
        setShowSequences(true)
        window.scrollTo({
            top: document.body.scrollHeight,  
            behavior: 'smooth'                
        });
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
      <div className="themesPart">
        <div className="themesPart-table">
          <h1> Les parties de <br></br><span style={{color:'black'}}>{themeTitle}</span> </h1>
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
                {themeParts.length > 0 ? (
                  themeParts.map((themePart) => (
                    <StyledTableRow key={themePart.id} onClick={() => handleThemePartClick(themePart)}>
                      <StyledTableCell align="center">{themePart.title}</StyledTableCell>
                      <StyledTableCell align="center">{themePart.description}</StyledTableCell>
                      <StyledTableCell align="center">
                        <img
                          src={`${SERVER}${themePart.image}`}
                          alt={themePart.title}
                          style={{ height: "50px" }}
                          onClick={(e) => handleImageClick(e, `${SERVER}${themePart.image}`)}
                        />
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {new Date(themePart.created_at).toLocaleString("fr-FR", {
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
                      Il n'existe aucune partie pour le théme <strong>{themeTitle}</strong>{" "}
                      <button onClick={openForm} className="add-theme-button">
                        Ajouter une partie
                      </button>
                    </StyledTableCell>
                  </StyledTableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {themeParts.length > 0 && (
            <button onClick={openForm} className="add-theme-button">
              Ajouter une partie
            </button>
          )}
        </div>
        {form && (
          <div className="add-form">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Titre</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Enter the theme part title"
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
                  placeholder="Enter the theme part description"
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
      {showSequences && <Module themePartID={id} themePartTitle={title} />}
    </>
  );
};

export default ThemeParts;
