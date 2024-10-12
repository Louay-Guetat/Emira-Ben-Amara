import React, { useEffect } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const StyledModal = styled(Modal)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    zIndex: '99999'
}));

const ModalContent = styled('div')(({ theme, isMobile }) => ({
    position: 'relative',
    width: isMobile ? '100%' : '50%',
    height: isMobile ? '90vh' : '95vh',
    display: 'flex',
    backgroundColor: 'white',
    padding: theme.spacing(isMobile ? 0.5 : 1),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[5],
    overflow: 'hidden',
}));

const CloseButton = styled(IconButton)(({ theme, isMobile }) => ({
    position: 'absolute',
    top: theme.spacing(isMobile ? 0.5 : 1),
    right: theme.spacing(isMobile ? 0.5 : 1),
    color: 'black'
}));

const PDFModal = ({ open, onClose, pdfSrc }) => {
    // Initialize the zoom plugin
    const zoomPluginInstance = zoomPlugin();
    const { ZoomIn, ZoomOut, ZoomPopover } = zoomPluginInstance;

    // Detect if the screen size is mobile
    const isMobile = useMediaQuery('(max-width:600px)');

    // Disable right-click globally inside the modal
    useEffect(() => {
        const handleContextMenu = (e) => {
            e.preventDefault();
        };

        document.addEventListener("contextmenu", handleContextMenu);

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
        };
    }, []);

    return (
        <StyledModal open={open} onClose={onClose}>
            <ModalContent isMobile={isMobile}>
                <CloseButton style={{ color: 'white' }} onClick={onClose} isMobile={isMobile}>
                    <CloseIcon />
                </CloseButton>
                <div style={{ width: '100%', height: '100%'}}>
                    <div 
                        style={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            marginBottom: isMobile ? '5px' : '10px',
                            flexDirection: 'row',
                        }}
                    >
                        {/* Zoom controls */}
                        <ZoomOut />
                        <ZoomPopover />
                        <ZoomIn />
                    </div>
                    <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
                        <Viewer fileUrl={pdfSrc} plugins={[zoomPluginInstance]} />
                    </Worker>
                </div>
            </ModalContent>
        </StyledModal>
    );
};

export default PDFModal;
