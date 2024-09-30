import { Button, TextField } from "@mui/material";
import React, { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import io from 'socket.io-client';
import { useNavigate, useParams } from 'react-router-dom';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import '../scss/pages/OneToOneMeet.scss';
import useUser from '../hooks/useUser';
import process from 'process';

window.process = process;

const socket = io.connect(`http://localhost:5000/`);

function OneToOneMeet() {
  const navigate = useNavigate()
  const [showMyVideo, setShowMyVideo] = useState(true);
  const { roomId } = useParams();
  const { user, loading } = useUser();
  const [me, setMe] = useState("");
  const [meCalled, setMeCalled] = useState(false)
  const [stream, setStream] = useState();
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [idToCall, setIdToCall] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState(user ? user.username : '');
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);
  const [screenShared, setScreenShared] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [recorder, setRecorder] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [chatVisible, setChatVisible] = useState(false);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    try{
      socket.emit("joinRoom", roomId);
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        setStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
      });
    }catch(err){
      console.log((err))
      navigate('/')
    }

    socket.on("me", (id) => {
      setMe(id);
    });
  
    // Listen for when receiving a call
    socket.on("receivingCall", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    });
  
    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      connectionRef.current.signal(signal);
    });
  
    // Cleanup
    return () => {
      socket.off("me");
      socket.off("receivingCall");
      socket.off("callAccepted");
    };
  }, [roomId]);

  const sendMessage = () => {
    socket.emit("message", { message, from: user.username });
    setMessages((prevMessages) => [...prevMessages, { from: user.username, message }]);
    setMessage("");
  };

  const callUser = (id) => {
    setReceivingCall(true)
    setMeCalled(true)
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: me,
        name: name,
      });
    });

    peer.on("stream", (userStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = userStream;
      }
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });

    peer.on("stream", (userStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = userStream;
      }
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);
    setShowMyVideo(false); // Hide user's video
    connectionRef.current.destroy();
    navigate('/')
  };

  const toggleVideo = () => {
    stream.getVideoTracks()[0].enabled = !videoOn;
    setVideoOn(!videoOn);
  };

  const toggleAudio = () => {
    stream.getAudioTracks()[0].enabled = !audioOn;
    setAudioOn(!audioOn);
  };

  const shareScreen = () => {
    if (!screenShared) {
      navigator.mediaDevices.getDisplayMedia({ cursor: true }).then((screenStream) => {
        const screenTrack = screenStream.getTracks()[0];
        const videoTrack = stream.getVideoTracks()[0]; // The original webcam video track
  
        // Replace the original video track with the screen track in the peer connection
        if (connectionRef.current) {
          connectionRef.current.replaceTrack(videoTrack, screenTrack, connectionRef.current.streams[0]);
        }
  
        // Update the myVideo source to the shared screen
        if (myVideo.current) {
          myVideo.current.srcObject = new MediaStream([screenTrack, ...stream.getAudioTracks()]);
        }
  
        setStream(new MediaStream([screenTrack, ...stream.getAudioTracks()]));
        setScreenShared(true);
  
        screenTrack.onended = () => {
          stopSharingScreen();
        };
      }).catch(err => {
        console.error("Error sharing screen: ", err);
      });
    } else {
      stopSharingScreen();
    }
  };
  
  const stopSharingScreen = () => {
    setScreenShared(false);
    
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((newStream) => {
      const newVideoTrack = newStream.getVideoTracks()[0];
      const audioTracks = newStream.getAudioTracks();
      
      // Update the myVideo source back to the webcam video
      if (myVideo.current) {
        myVideo.current.srcObject = new MediaStream([newVideoTrack, ...audioTracks]);
      }
  
      // Replace the screen track with the webcam video track in the peer connection
      if (connectionRef.current) {
        connectionRef.current.replaceTrack(stream.getVideoTracks()[0], newVideoTrack, connectionRef.current.streams[0]);
      }
      
      // Update the main stream
      setStream(new MediaStream([newVideoTrack, ...audioTracks]));
    }).catch(err => {
      console.error("Error restoring webcam: ", err);
    });
  };
  
  
  const startRecording = () => {
    const options = { mimeType: "video/webm" };
    const mediaRecorder = new MediaRecorder(stream, options);
    setRecorder(mediaRecorder);

    mediaRecorder.ondataavailable = (event) => {
      setRecordedChunks((prev) => prev.concat(event.data));
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recorder.stop();
    setIsRecording(false);
  };

  const downloadRecording = () => {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recording.webm";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="visioconference">
      <div className="video-container">
        <video playsInline muted ref={myVideo} autoPlay />
        {showMyVideo && callAccepted && !callEnded && (
          <video playsInline ref={userVideo} autoPlay />
        )}
      </div>
      <div className="controls">
        <Button variant="contained" color="primary" onClick={() => callUser(idToCall)}>
          Call User
        </Button>
        {!meCalled && receivingCall && !callAccepted && (
          <Button variant="contained" color="secondary" onClick={answerCall}>
            Answer Call
          </Button>
        )}
        <Button variant="contained" color="error" onClick={leaveCall} disabled={!callAccepted}>
          Leave Call
        </Button>
        <Button variant="contained" onClick={toggleVideo}>
          {videoOn ? <VideocamOffIcon /> : <VideocamIcon />}
        </Button>
        <Button variant="contained" onClick={toggleAudio}>
          {audioOn ? <MicOffIcon /> : <MicIcon />}
        </Button>
        <Button variant="contained" onClick={shareScreen}>
          {screenShared ? <StopScreenShareIcon /> : <ScreenShareIcon />}
        </Button>
        <Button variant="contained" onClick={startRecording} disabled={isRecording}>
          Record
        </Button>
        <Button variant="contained" onClick={stopRecording} disabled={!isRecording}>
          Stop
        </Button>
        <Button variant="contained" onClick={downloadRecording} disabled={recordedChunks.length === 0}>
          Download
        </Button>
        <Button variant="contained" onClick={() => setChatVisible(!chatVisible)}>
          <ChatIcon />
        </Button>
      </div>
      {chatVisible && (
        <div className="chat-container">
          <div className="messages">
            {messages.map((msg, index) => (
              <div key={index} className={msg.from === user.username ? 'my-message' : 'other-message'}>
                <strong>{msg.from}: </strong>{msg.message}
              </div>
            ))}
          </div>
          <TextField 
            variant="outlined" 
            label="Type your message..." 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
          />
          <Button variant="contained" color="primary" onClick={sendMessage}>
            Send
          </Button>
        </div>
      )}
    </div>
  );
}

export default OneToOneMeet;
