import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import '../../scss/pages/OneToManyMeet/Viewer.scss';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faPhoneSlash, faUsers, faComments } from '@fortawesome/free-solid-svg-icons';

const Viewer = ({ user, toggleChat, toggleUserList, streamID }) => {
    const videoRef = useRef(null);
    const peerRef = useRef(null); // Keep reference to peer connection
    const [connected, setConnected] = useState(false);
    const navigate = useNavigate()

    async function init() {
        const peer = createPeer();
        peer.addTransceiver("video", { direction: "recvonly" });
        peer.addTransceiver("audio", { direction: "recvonly" }); // Add audio transceiver
        peerRef.current = peer; // Save peer reference
        setConnected(true);
    }

    function createPeer() {
        const peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.stunprotocol.org"
                }
            ]
        });
        peer.ontrack = handleTrackEvent;
        peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

        return peer;
    }

    async function handleNegotiationNeededEvent(peer) {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        const payload = { 
            sdp: peer.localDescription,
            streamId: streamID,
            user: {
                user_id: user.id,
                username: user.username,
                email: user.email
            }
        };

        const response = await axios.post('/consumer', payload);
        if (response.status === 205){
            navigate('/')
        }else{
            const desc = new RTCSessionDescription(response.data.sdp);
            peer.setRemoteDescription(desc).catch(e => console.log(e));
        }
    }

    function handleTrackEvent(e) {
        document.getElementById("video").srcObject = e.streams[0];
        // Optional: Handle audio track if needed
        const audioTracks = e.streams[0].getAudioTracks();
        if (audioTracks.length > 0) {
            console.log("Audio track received.");
        } else {
            console.log("No audio track received.");
        }
    }

    const exitStream = async () => {
        if (peerRef.current) {
            // Close the peer connection
            peerRef.current.close();
            peerRef.current = null;

            // Stop the video stream
            const videoElement = document.getElementById("video");
            if (videoElement.srcObject) {
                videoElement.srcObject.getTracks().forEach(track => track.stop());
                videoElement.srcObject = null;
            }

            setConnected(false);
            navigate('/')
        }
    }

    const requestMicrophone = () => {
        
    }

    return (
        <div className="viewer-container">
            <h1> Emira Ben Amara </h1>
            <video id="video" autoPlay ref={videoRef} volume="1"></video>
            <div className='buttons'>
                <button onClick={requestMicrophone}>
                    <FontAwesomeIcon icon={faMicrophone} />
                </button>
                <button onClick={toggleUserList}>
                    <FontAwesomeIcon icon={faUsers} />
                </button>
                <button onClick={toggleChat}>
                    <FontAwesomeIcon icon={faComments} />
                </button>
                { !connected ? <button onClick={init}>View Stream</button> : <button onClick={exitStream} style={{backgroundColor: 'red'}}>
                        <FontAwesomeIcon icon={faPhoneSlash} color='white' />
                    </button> }
            </div>
        </div>
    );
};

export default Viewer;
