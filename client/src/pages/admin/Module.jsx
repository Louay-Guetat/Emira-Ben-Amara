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
import PDFModal from "../../components/PDFModal";
import VideoModal from "../../components/VideoModal";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-regular-svg-icons'; // Import the regular version of the user icon

const Module = ({ themePartID, themePartTitle }) =>{
    const [modules, setModules] = useState([]);
    const [form, setForm] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [video, setVideo] = useState(null);
    const [ebook, setEbook] = useState(null);
    const [assessments, setAssessments] = useState(null);
    const [price, setPrice] = useState("");
    const [editing, setEditing] = useState(false);
    const [id, setID] = useState()
    const [selectedPDF, setSelectedPDF] = useState('');
    const [pdfModalOpen, setPDFModalOpen] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState('');
    const [videoModalOpen, setVideoModalOpen] = useState(false);
  
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
      const fetchModules = async () => {
        try {
          const response = await axios.get(`${SERVER}/modules/getModules`, {
            params: { themePartID },
          });
          if (response.status === 200) {
            setModules(response.data.modules);
          }
        } catch (err) {
          console.log(err);
        }
      };
  
      if (themePartID) {
        fetchModules();
      }
    }, [themePartID]);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
    
      const formData = new FormData();
      formData.append("themePartID", themePartID);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
    
      // Append files if they exist
      if (video) formData.append("video", video);
      if (ebook) formData.append("ebook", ebook);
      if (assessments) formData.append("assessments", assessments);
    
      try {
        let response;
        if (editing) {
          // Append ID for editing
          formData.append('id', id);
    
          // Send a PUT request to update the theme part
          response = await axios.put(`${SERVER}/modules/updateModule`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
    
          if (response.status === 200) {
            // Update the theme part in the state
            setModules((prevModules) =>
              prevModules.map((module) =>
                module.id === id ? response.data.module : module
              )
            );
            setForm(false); // Close form after successful update
          }
        } else {
          // Send a POST request to add a new theme part
          response = await axios.post(`${SERVER}/modules/addModule`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
    
          if (response.status === 200) {
            // Add the new theme part to the list
            setModules((prevModules) => [...prevModules, response.data.module]);
            resetForm(); // Reset form after successful addition
          }
        }
      } catch (err) {
        console.error("An error occurred while submitting the form:", err);
      }
    };    
  
    const openForm = () =>{
      setTitle('')
      setDescription('')
      setID('')
      setForm(true)
  }
  
    const resetForm = () => {
      setTitle("");
      setDescription("");
      setForm(false);
      setEditing(false);
    };
  
    const handleModuleClick = (module) =>{
          setDescription(module.description)
          setTitle(module.title)
          setPrice(module.price)
          setForm(true)
          setEditing(true)
          setID(module.id)
    }

    const handlePDFClick = (event, pdfSrc) => {
      event.stopPropagation();
      setSelectedPDF(pdfSrc);
      setPDFModalOpen(true);
    };
  
    const handleVideoClick = (event, videoSrc) => {
      event.stopPropagation();
      setSelectedVideo(videoSrc);
      setVideoModalOpen(true);
    };
  
    return(
        <div className="part-sequences">
            <div className="partSequences-table">
                <h1> Les Modules de <span style={{color:'black'}}>{themePartTitle}</span> </h1>
                <TableContainer component={Paper}>
                <Table aria-label="customized table">
                    <TableHead>
                    <TableRow>
                        <StyledTableCell align="center">Titre</StyledTableCell>
                        <StyledTableCell align="center">Description</StyledTableCell>
                        <StyledTableCell align="center">Video</StyledTableCell>
                        <StyledTableCell align="center">Ebook</StyledTableCell>
                        <StyledTableCell align="center">Assesement</StyledTableCell>
                        <StyledTableCell align="center">Prix</StyledTableCell>
                        <StyledTableCell align="center">Date de Creation</StyledTableCell>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {modules.length > 0 ? (
                        modules.map((module) => (
                        <StyledTableRow key={module.id} onClick={() => handleModuleClick(module)}>
                            <StyledTableCell align="center">{module.title}</StyledTableCell>
                            <StyledTableCell align="center">{module.description}</StyledTableCell>
                            <StyledTableCell align="center">
                            <video
                                src={`${SERVER}${module.video}`}
                                alt={module.title}
                                style={{ height: "50px" }}
                                onClick={(e) => handleVideoClick(e, `${SERVER}${module.video}`)}
                            />
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              <button
                                style={{cursor:'pointer', backgroundColor:'transparent', border:'none'}}
                                onClick={(e) => handlePDFClick(e, `${SERVER}${module.ebook}`)}
                              > 
                                <FontAwesomeIcon icon={faFilePdf} size="2xl" />  
                              </button>
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              <button
                                style={{cursor:'pointer', backgroundColor:'transparent', border:'none'}}
                                onClick={(e) => handlePDFClick(e, `${SERVER}${module.assessments}`)}
                              > 
                                <FontAwesomeIcon icon={faFilePdf} size="2xl" /> 
                              </button>
                            </StyledTableCell>
                            <StyledTableCell align="center">{module.price} DT</StyledTableCell>
                            <StyledTableCell align="center">
                            {new Date(module.created_at).toLocaleString("fr-FR", {
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
                        <StyledTableCell colSpan={7} align="center">
                            Il n'existe aucune Module pour la partie <strong>{themePartTitle}</strong>{" "}
                            <button onClick={openForm} className="add-theme-button">
                            Ajouter un Module
                            </button>
                        </StyledTableCell>
                        </StyledTableRow>
                    )}
                    </TableBody>
                </Table>
                </TableContainer>
                {modules.length > 0 && (
                <button onClick={openForm} className="add-theme-button">
                    Ajouter un Module
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
                      placeholder="Enter the module title"
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
                      placeholder="Enter the module description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    ></textarea>
                  </div>
        
                  <div className="form-group">
                    <label htmlFor="price">Price</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      placeholder="Enter the module price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
        
                  <div className="form-group">
                    <label htmlFor="video">Video</label>
                    <input
                      type="file"
                      id="video"
                      name="video"
                      accept="video/*"
                      onChange={(e) => setVideo(e.target.files[0])}
                      required={!editing}
                    />
                  </div>
        
                  <div className="form-group">
                    <label htmlFor="ebook">Ebook (PDF)</label>
                    <input
                      type="file"
                      id="ebook"
                      name="ebook"
                      accept=".pdf"
                      onChange={(e) => setEbook(e.target.files[0])}
                    />
                  </div>
        
                  <div className="form-group">
                    <label htmlFor="assessments">Assessments</label>
                    <input
                      type="file"
                      id="assessments"
                      name="assessments"
                      onChange={(e) => setAssessments(e.target.files[0])}
                    />
                  </div>
        
                  <div className="form-actions">
                    <button type="submit">{editing ? "Modifier" : "Ajouter"}</button>
                    <button
                      type="button"
                      onClick={resetForm}
                    >
                      Close
                    </button>
                  </div>
                </form>
              </div>
            )}
            <PDFModal
              open={pdfModalOpen}
              onClose={() => setPDFModalOpen(false)}
              pdfSrc={selectedPDF}
            />
            <VideoModal
              open={videoModalOpen}
              onClose={() => setVideoModalOpen(false)}
              videoSrc={selectedVideo}
            />
        </div>
    )
}

export default Module;