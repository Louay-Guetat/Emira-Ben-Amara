import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import '../../scss/pages/OneToManyMeet/Viewer.scss';

const Viewer = ({ user }) => {
    const videoRef = useRef(null);
    const peerRef = useRef(null); // Keep reference to peer connection
    const [connected, setConnected] = useState(false)

    async function init() {
        const peer = createPeer();
        peer.addTransceiver("video", { direction: "recvonly" });
        peer.addTransceiver("audio", { direction: "recvonly" }); // Add audio transceiver
        setConnected(true)
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
            user: {
                user_id : user.id,
                username: user.username,
                email: user.email
            }
        };

        const { data } = await axios.post('/consumer', payload);
        const desc = new RTCSessionDescription(data.sdp);
        peer.setRemoteDescription(desc).catch(e => console.log(e));
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
    };

    return (
        <div className="viewer-container">
            <h1> Emira Ben Amara </h1>
            <video id="video" autoPlay ref={videoRef} volume="1"></video>
            { !connected ? <button onClick={init}>View Stream</button> : null }
        </div>
    );
};

export default Viewer;
