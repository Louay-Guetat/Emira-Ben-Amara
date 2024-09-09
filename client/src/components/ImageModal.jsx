// src/components/ImageModal.js

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
    maxWidth: '90%',
    maxHeight: '90%',
    backgroundColor: 'white',
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[5],
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
}));

const ImageModal = ({ open, onClose, imageSrc }) => {
    return (
        <StyledModal open={open} onClose={onClose}>
            <ModalContent>
                <CloseButton onClick={onClose}>
                    <CloseIcon />
                </CloseButton>
                <img src={imageSrc} alt="Large view" style={{ maxWidth: '100%', maxHeight: '100%' }} />
            </ModalContent>
        </StyledModal>
    );
};

export default ImageModal;
