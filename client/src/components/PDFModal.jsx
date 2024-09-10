import React from 'react';
import { styled } from '@mui/material/styles';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const StyledModal = styled(Modal)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const ModalContent = styled('div')(({ theme }) => ({
    position: 'relative',
    width: '75vw', 
    height: '75vh',
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
    return (
        <StyledModal open={open} onClose={onClose}>
            <ModalContent>
                <CloseButton onClick={onClose}>
                    <CloseIcon />
                </CloseButton>
                <div style={{ width: '100%', height: '100%' }}>
                    <iframe
                        src={pdfSrc}
                        width="100%"
                        height="100%"
                        style={{ border: 'none' }}
                    />
                </div>
            </ModalContent>
        </StyledModal>
    );
};

export default PDFModal;
