import React, { useEffect } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';

const StyledModal = styled(Modal)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const ModalContent = styled('div')(({ theme }) => ({
    position: 'relative',
    width: '50%',
    height: '95vh',
    backgroundColor: 'white',
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[5],
    overflow: 'hidden',
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
}));

const PDFModal = ({ open, onClose, pdfSrc }) => {
    // Initialize the zoom plugin
    const zoomPluginInstance = zoomPlugin();
    const { ZoomIn, ZoomOut, ZoomPopover } = zoomPluginInstance;

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
            <ModalContent>
                <CloseButton style={{ marginRight: '2.5%', color: 'white' }} onClick={onClose}>
                    <CloseIcon />
                </CloseButton>
                <div style={{ width: '100%', height: '100%'}}>
                    <div style={{ display: 'flex', justifyContent: 'center',marginBottom: '10px' }}>
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
