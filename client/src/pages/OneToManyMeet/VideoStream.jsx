import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../scss/pages/OneToManyMeet/VideoStream.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo, faVideoSlash, faMicrophone, faMicrophoneSlash, faDesktop, faRecordVinyl, faUsers, faComments, faPhoneSlash } from '@fortawesome/free-solid-svg-icons';

const VideoStream = ({ user, toggleChat, toggleUserList, streamID }) => {
    const videoRef = useRef(null);
    const [peer, setPeer] = useState(null);
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [micEnabled, setMicEnabled] = useState(true);
    const [screenSharing, setScreenSharing] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recording, setRecording] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [meetingStart, setMeetingStart] = useState(false)
    const navigate = useNavigate()

    const init = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const newPeer = createPeer(stream);
            if (newPeer){
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setCameraStream(stream);
                setPeer(newPeer);
                setMeetingStart(true)
            }
        } catch (error) {
            console.error("Error accessing media devices.", error);
        }
    };

    const createPeer = (stream) => {
        const peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.stunprotocol.org" }],
        });
        peerConnection.onnegotiationneeded = () => handleNegotiationNeededEvent(peerConnection);

        stream.getTracks().forEach(track => {
            peerConnection.addTrack(track, stream);
        });

        return peerConnection;
    };

    const handleNegotiationNeededEvent = async (peerConnection) => {
        try {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            
            const payload = { 
                sdp: peerConnection.localDescription,
                streamId: streamID,
                user: {
                    user_id : user.id,
                    username: user.username,
                    email: user.email
                }
            };
    
            const response = await axios.post('/broadcast', payload);
            if (response.status === 205){
                navigate('/')
                return null;
            }else{
                const desc = new RTCSessionDescription(response.data.sdp);
                await peerConnection.setRemoteDescription(desc);
            }
        } catch (error) {
            console.error('Error during negotiation:', error);
        }
    };

    const toggleCamera = () => {
        const stream = videoRef.current?.srcObject;
        if (stream) {
            setCameraEnabled(prev => !prev);
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
            }
        } else {
            console.error("Stream is not available.");
        }
    };

    const toggleMic = () => {
        const stream = videoRef.current?.srcObject;
        if (stream) {
            setMicEnabled(prev => !prev);
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
            }
        } else {
            console.error("Stream is not available.");
        }
    };

    const shareScreen = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            
            // Replace the current video source with the screen stream
            if (videoRef.current) {
                videoRef.current.srcObject = screenStream;
            }
    
            // Replace the video tracks in the peer connection
            peer.getSenders().forEach(sender => {
                if (sender.track.kind === 'video') {
                    sender.replaceTrack(screenStream.getVideoTracks()[0]);
                }
            });
    
            // Restore the camera stream when screen sharing ends
            screenStream.getVideoTracks()[0].addEventListener('ended', () => {
                // Reassign the camera stream
                if (videoRef.current) {
                    videoRef.current.srcObject = cameraStream;
                }
    
                // Replace the screen track with the camera track in the peer connection
                peer.getSenders().forEach(sender => {
                    if (sender.track.kind === 'video') {
                        sender.replaceTrack(cameraStream.getVideoTracks()[0]);
                    }
                });
    
                setScreenSharing(false); // Update state
            });
    
            setScreenSharing(true);
        } catch (error) {
            console.error("Error sharing screen:", error);
        }
    };    

    const startRecording = () => {
        const stream = videoRef.current?.srcObject;
        if (stream) {
            const recorder = new MediaRecorder(stream);
            setMediaRecorder(recorder);
    
            let recordedChunks = [];
    
            // Capture the data when available
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };
    
            recorder.start();
            setRecording(true);
    
            // Save the recorded chunks for download
            recorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                
                // Create a download link and trigger it
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                a.download = `Event_${new Date()}_record.webm`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url); // Clean up the URL object
            };
        } else {
            console.error("Stream is not available for recording.");
        }
    };
    
    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setRecording(false);
        }
    };    

    const endCall = () => {
        if (peer) {
            peer.close();
            setPeer(null);
        }
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop()); 
            setCameraStream(null);
            navigate('/')
        }
    };    

    return (
        <div className="container">
            {!meetingStart ? (<button onClick={init}> start meeting </button>) : null} 
            <video ref={videoRef} autoPlay playsInline />
            <div className="controls">
                <button onClick={toggleCamera}>
                    <FontAwesomeIcon icon={cameraEnabled ? faVideo : faVideoSlash} />
                </button>
                <button onClick={toggleMic}>
                    <FontAwesomeIcon icon={micEnabled ? faMicrophone : faMicrophoneSlash} />
                </button>
                <button onClick={!screenSharing ? shareScreen : null} disabled={screenSharing}>
                    <FontAwesomeIcon icon={faDesktop} />
                </button>
                <button onClick={recording ? stopRecording : startRecording}>
                    {recording ? <FontAwesomeIcon icon={faRecordVinyl} fade style={{color: "#ff1a1a",}} /> : <FontAwesomeIcon icon={faRecordVinyl} /> } 
                </button>
                <button onClick={toggleUserList}>
                    <FontAwesomeIcon icon={faUsers} /> {/* Button to open user list */}
                </button>
                <button onClick={toggleChat}>
                    <FontAwesomeIcon icon={faComments} /> {/* Button to open chat */}
                </button>
                {meetingStart ? 
                    (<button onClick={endCall} style={{backgroundColor: 'red'}}>
                        <FontAwesomeIcon icon={faPhoneSlash} color='white' />
                    </button>) : null }
            </div>
        </div>
    );
};

export default VideoStream;
