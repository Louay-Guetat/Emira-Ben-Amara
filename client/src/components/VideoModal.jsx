// src/components/VideoModal.js

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
    maxWidth: '100%',
    maxHeight: '100%',
    backgroundColor: 'black',
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[5],
    overflow: 'auto'
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
}));

const VideoModal = ({ open, onClose, videoSrc }) => {
    return (
        <StyledModal open={open} onClose={onClose}>
            <ModalContent>
                <CloseButton onClick={onClose}>
                    <CloseIcon />
                </CloseButton>
                <video controls style={{ width: '100%', height: '100%' }}>
                    <source src={videoSrc} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </ModalContent>
        </StyledModal>
    );
};

export default VideoModal;
