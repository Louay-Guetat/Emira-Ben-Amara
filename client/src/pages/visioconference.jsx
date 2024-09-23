import { Button, IconButton, TextField } from "@mui/material";
import React, { useEffect, useRef, useState } from 'react'; 
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Peer from 'simple-peer';
import io from 'socket.io-client';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PhoneIcon from '@mui/icons-material/Phone';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded';
import StopIcon from '@mui/icons-material/Stop';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import '../scss/pages/visioconference.scss';
import useUser from '../hooks/useUser';
import process from 'process';
window.process = process;

const socket = io.connect("http://localhost:5000");

function Visioconference() {
  const { user, loading } = useUser();
  const [me, setMe] = useState("");
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
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      setStream(stream);
      if (myVideo.current) {
        myVideo.current.srcObject = stream;
      }
    });

    socket.on("me", (id) => {
      setMe(id);
    });

    socket.on("callUser", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setName(data.name);
      setCallerSignal(data.signal);
    });

    // Receive chat messages
    socket.on("message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });
  }, []);

  const sendMessage = () => {
    socket.emit("message", { message, from: user.username });
    setMessages((prevMessages) => [...prevMessages, { from: user.username, message }]);
    setMessage("");
  };

  const callUser = (id) => {
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

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
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
    connectionRef.current.destroy();
    if (recorder) {
      recorder.stop();
    }
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
  
        if (connectionRef.current) {
          connectionRef.current.replaceTrack(
            stream.getVideoTracks()[0],
            screenTrack,
            stream
          );
        } else {
          console.error("Peer connection is not established.");
        }
  
        setStream(screenStream);
        setScreenShared(true);
  
        screenTrack.onended = () => {
          stopSharingScreen();
        };
      });
    } else {
      stopSharingScreen();
    }
  };  

  const stopSharingScreen = () => {
    setScreenShared(false);
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      const videoTrack = stream.getVideoTracks()[0];
      connectionRef.current.replaceTrack(
        stream.getVideoTracks()[0],
        videoTrack,
        stream
      );
      setStream(stream);
      if (myVideo.current) {
        myVideo.current.srcObject = stream;
      }
    });
  };

  const startRecording = () => {
    const options = { mimeType: "video/webm" };
    const mediaRecorder = new MediaRecorder(stream, options);
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks((prev) => [...prev, event.data]);
      }
    };
  
    mediaRecorder.start();
    setRecorder(mediaRecorder);
    setIsRecording(true); // Set recording state to true
  };
  
  const stopRecording = () => {
    if (recorder) {
      recorder.stop();
      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" }); // Change to the same type as in options
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `${new Date()}.webm`; // Change the file extension if necessary
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
  
        // Reset recorder state after stopping
        setRecorder(null);
        setRecordedChunks([]);
        setIsRecording(false);
      };
    }
  };
  

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  } else {
    return (
      <div className="visioconference">
        <div className="container">
          <div className="video-container">
            <div className="video">{stream && <video playsInline muted ref={myVideo} autoPlay />}</div>
            {callAccepted && !callEnded ? <div className="video"> <video playsInline ref={userVideo} autoPlay /></div> : null}
          </div>

            <div className="myId">
              <TextField
                id="filled-basic"
                label="Name"
                variant="filled"
                value={user.username}
                onChange={(e) => setName(e.target.value)}
                style={{ marginBottom: "20px" }}
              />
              <CopyToClipboard text={me} style={{ marginBottom: "2rem" }}>
                <Button variant="contained" color="primary" startIcon={<AssignmentIcon fontSize="large" />}>
                  Copy ID
                </Button>
              </CopyToClipboard>

              <TextField
                id="filled-basic"
                label="ID to call"
                variant="filled"
                value={idToCall}
                onChange={(e) => setIdToCall(e.target.value)}
              />
              <div className="call-button">
                {callAccepted && !callEnded ? (
                  <Button variant="contained" color="secondary" onClick={leaveCall}>
                    End Call
                  </Button>
                ) : (
                  <IconButton color="primary" aria-label="call" onClick={() => callUser(idToCall)}>
                    <PhoneIcon fontSize="large" />
                  </IconButton>
                )}
              </div>
            </div>

          <div className="call-container">
            {receivingCall && !callAccepted ? (
              <div className="caller">
                <h1>{name} is calling...</h1>
                <Button variant="contained" color="primary" onClick={answerCall}>
                  Answer
                </Button>
              </div>
            ) : null}

            <div className="controls">
              <IconButton color="primary" aria-label="video" onClick={toggleVideo}>
                {videoOn ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>
              <IconButton color="primary" aria-label="audio" onClick={toggleAudio}>
                {audioOn ? <MicIcon /> : <MicOffIcon />}
              </IconButton>
              <IconButton color="primary" aria-label="screen share" onClick={shareScreen}>
                {screenShared ? <StopScreenShareIcon /> : <ScreenShareIcon />}
              </IconButton>
              <IconButton color="primary" aria-label="record" onClick={toggleRecording}>
                {isRecording ? <StopIcon /> : <FiberManualRecordRoundedIcon />}
              </IconButton>
              <IconButton color="primary" aria-label="chat" onClick={() => setChatVisible(!chatVisible)}>
                <ChatIcon />
              </IconButton>
            </div>
          </div>
        </div>
        {/* Chat Section */}
        {chatVisible && (
            <div className="chat-section">
              <div className="chat-messages">
                {messages.map((msg, index) => (
                  <div key={index}>
                    <strong>{msg.from}: </strong>
                    {msg.message}
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <textarea
                  id="outlined-basic"
                  label="Type a message..."
                  variant="outlined"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  fullWidth
                />
                <Button variant="contained" color="primary" onClick={sendMessage}>
                  Send
                </Button>
              </div>
            </div>
          )}
      </div>
    );
  }
}

export default Visioconference;
