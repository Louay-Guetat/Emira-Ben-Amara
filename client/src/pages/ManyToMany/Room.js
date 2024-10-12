import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import SimplePeer from "simple-peer";
import { useParams } from "react-router";
import VideoPlayer from "./VideoPlayer";
import Controls from "./Controls";
import SidePanel from "./SidePanel";
import useUser from "../../hooks/useUser";
import '../../scss/pages/OneToManyMeet/Room.scss'

const Room = () => {
  const navigate = useNavigate()
  const {user, loading} = useUser();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [peers, setPeers] = useState([]);
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const socketRef = useRef();
  const userVideo = useRef();
  const userStream = useRef();
  const peersRef = useRef([]);
  const params = useParams();
  const roomID = params.roomID;
  const [screenShare, setScreenShare] = useState(false);
  const screenTrackRef = useRef();
  const [messages, setMessages] = useState([]);
  const [showSidePanel, setShowSidePanel] = useState(null);
  const [inMeet, setInMeet] = useState(false)

  const enter = () => {
    setInMeet(true);
    socketRef.current = io.connect(`http://localhost:5000`);
  
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;
        userStream.current = stream;
        userVideo.current.muted = true;
  
        // Initially turn off audio and video after acquiring them
        muteAudio();
        muteVideo();
  
        window.addEventListener("popstate", leave);
        window.addEventListener("beforeunload", leave);
  
        // Emit join room event and handle response
        socketRef.current.emit("b-join room", { roomID, userName: user });
  
        // Handle server errors like room not allowed or room full
        socketRef.current.on("error", (errorMsg) => {
          alert(errorMsg); // Show the error message
          navigate("/");   // Navigate to the home page
        });
  
        socketRef.current.on("f-users joined", (users) => {
          const temp = [];
          users.forEach(({ id, userName }) => {
            const existingPeer = peers.find((peer) => peer.peerID === id);
  
            if (!existingPeer) {
              const peer = createPeer(id, socketRef.current.id, stream);
              peersRef.current.push({
                peerID: id,
                userName,
                peer,
              });
              temp.push({
                peerID: id,
                userName,
                peer,
              });
            } else {
              temp.push(existingPeer);
            }
          });
          setPeers(temp);
        });
  
        socketRef.current.on("f-get request", ({ signal, from, userName }) => {
          const existingPeer = peers.find((peer) => peer.peerID === from);
  
          if (!existingPeer) {
            const peer = addPeer(signal, from, stream);
            peersRef.current.push({
              peerID: from,
              peer,
              userName,
            });
            const peerObj = {
              peer,
              peerID: from,
              userName,
            };
  
            setPeers((users) => [...users, peerObj]);
          } else {
            console.log(`Peer with ID ${from} already exists.`);
          }
        });
  
        socketRef.current.on("f-accepted connect", ({ signal, id }) => {
          const item = peersRef.current.find((p) => p.peerID === id);
          item.peer.signal(signal);
        });
  
        socketRef.current.on("f-receive message", ({ message, userName, time }) => {
          let obj = { message, userName, time, file: false };
          setMessages((prevMessages) => [obj, ...prevMessages]);
        });
  
        socketRef.current.on("f-recieve file", recieveFile);
  
        socketRef.current.on("user left", (id) => {
          handleLeave(id);
        });
      })
      .catch((err) => {
        console.error("Error getting media devices:", err);
        navigate("/"); // Navigate to home if there’s an issue with media devices
      });
  };  

  const createPeer = (userToConnect, from, stream) => {
    const existingPeer = peersRef.current.find(p => p.peerID === userToConnect);
    if (existingPeer) {
      console.log(`Peer with ID ${userToConnect} already exists.`);
      return existingPeer.peer;
    }
  
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream,
    });
  
    peer.on("signal", (signal) => {
      socketRef.current.emit("b-request connect", {
        userToConnect,
        from,
        signal,
        userName: user,
      });
    });
  
    return peer;
  };
  

  const addPeer = (incomingSignal, from, stream) => {
    const peer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream,
    });
  
    peer.on("signal", (signal) => {
      // Send the peer's signal back to the original user (completes the handshake)
      socketRef.current.emit("b-accept connect", { signal, from });
    });
  
    peer.signal(incomingSignal);
  
    return peer;
  };
  

  const muteAudio = () => {
  setMicActive((prev) => !prev);
  if (userStream.current) {
    const audioTracks = userStream.current.getAudioTracks();
    if (audioTracks.length > 0) {
      audioTracks[0].enabled = !audioTracks[0].enabled;
    }
  }
};

const muteVideo = () => {
  setCameraActive((prev) => !prev);
  if (userStream.current) {
    const videoTracks = userStream.current.getVideoTracks();
    if (videoTracks.length > 0) {
      videoTracks[0].enabled = !videoTracks[0].enabled;
    }
  }
};

  const screenSharing = () => {
    if (!screenShare) {
      navigator.mediaDevices
        .getDisplayMedia({ cursor: true })
        .then((stream) => {
          const screenTrack = stream.getTracks()[0];

          peersRef.current.forEach(({ peer }) => {
            // replaceTrack (oldTrack, newTrack, oldStream);
            peer.replaceTrack(
              peer.streams[0]
                .getTracks()
                .find((track) => track.kind === "video"),
              screenTrack,
              userStream.current
            );
          });

          // Listen click end
          screenTrack.onended = () => {
            peersRef.current.forEach(({ peer }) => {
              peer.replaceTrack(
                screenTrack,
                peer.streams[0]
                  .getTracks()
                  .find((track) => track.kind === "video"),
                userStream.current
              );
            });
            userVideo.current.srcObject = userStream.current;
            setScreenShare(false);
          };

          userVideo.current.srcObject = stream;
          screenTrackRef.current = screenTrack;
          setScreenShare(true);
        });
    } else {
      screenTrackRef.current.onended();
    }
  };

  const handleLeave = (id) => {
    const peerObj = peersRef.current.find((p) => p.peerID === id);
    if (peerObj) {
      // Clean up the peer connection
      peerObj.peer.destroy();
      
      // Remove the peer from the array
      peersRef.current = peersRef.current.filter((p) => p.peerID !== id);
      
      // Update state
      setPeers((prevPeers) => prevPeers.filter((p) => p.peerID !== id));
    }
  };  
  
  const leave = (e) => {
    e.preventDefault();
    
    // Clean up socket and peers
    if (socketRef.current) {
        // Notify other users that this user is leaving
        socketRef.current.emit("user-leaving");  // Use a custom event
       
        // Properly disconnect the socket
        socketRef.current.disconnect();
    }

    // Stop all tracks in user media stream
    if (userStream.current) {
        userStream.current.getTracks().forEach(track => track.stop());
    }

    // Clean up peer connections
    peersRef.current.forEach((p) => p.peer.destroy());

    // Reset all states
    setPeers([]);
    setInMeet(false);

    // Navigate away after cleanup
    sessionStorage.removeItem("user");
    window.location.href = "/";
};

  const sendMessage = (msg) => {
    if (msg !== "") {
      const time = getCurrentTime();
      socketRef.current.emit("b-send message", {
        message: msg,
        roomID,
        userName: user,
        time,
      });
    }
  };
  const getCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";

    // Convert hours to 12-hour format
    hours = hours % 12 || 12;

    // Add leading zero to minutes if needed
    minutes = minutes < 10 ? "0" + minutes : minutes;

    const formattedTime = `${hours}:${minutes} ${ampm}`;

    return formattedTime;
  };

  const sendFile = (file) => {
    if (file) {
      let toSend = {
        body: file,
        user,
        mimeType: file.type,
        fileName: file.name,
        time: getCurrentTime(),
      };
      socketRef.current.emit("b-send file", { roomID, body: toSend });
    }
  };
  const recieveFile = (data) => {
    let obj = {
      message: data,
      userName: data.user,
      time: data.time,
      file: true,
    };
    setMessages((prevMessages) => [obj, ...prevMessages]);
    //const sound = new Audio(notification);
    //sound.play();
  };
  const toggleSidePanel = (target) => {
    if (target === "Chats") {
      if (showSidePanel === "Chats") {
        setShowSidePanel(null);
      } else {
        setShowSidePanel(target);
      }
    } else {
      if (showSidePanel === "People") {
        setShowSidePanel(null);
      } else {
        setShowSidePanel(target);
      }
    }
  };
  const elementRef = useRef(null);

  const requestFullScreen = () => {
    const element = elementRef.current;

    if (element) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    }
  };

  const playSound = (target) => {
    socketRef.current.emit("b-send sound", { roomID, target });
  };

  if(!user){

  }else{
    console.log(peers)
    return (
      <div className="Room">
        { !inMeet && (<button id="start-event" onClick={enter}> Entrer L'événement </button>) }
        
        <div className="video-components">
            <div className="attendents">
            {peers.length > 0 && (
                <>
                  {/* Sort the peers array to display admin first */}
                  {peers
                    .sort((a, b) => (a.userName.role === 'admin' ? -1 : 1))
                    .slice(0, isMobile ? 2 : 10)
                    .map((p, key) => (
                      <>
                        <VideoPlayer key={p.peerID} peer={p.peer} user={p.userName} />
                        <VideoPlayer key={p.peerID} peer={p.peer} user={p.userName} />
                      </>
                    ))}
                </>
            )}

            </div>
            <div className="host">
                <div className="my-video">
                  {inMeet && (
                    <>
                      <video muted ref={userVideo} autoPlay playsInline />
                      <div className="videoBottom">
                        <h6>{user.username}</h6>
                      </div>
                      <Controls
                        muteVideo={muteVideo}
                        cameraActive={cameraActive}
                        muteAudio={muteAudio}
                        micActive={micActive}
                        screenSharing={screenSharing}
                        screenShare={screenShare}
                        leave={leave}
                        playSound={playSound}
                        toggleSidePanel={toggleSidePanel}
                      />
                    </>
                  )}
                </div>

                {/* Show 1 more user next to the host */}
                {peers.length > 1 && (
                  <div className="extra-user">
                    <VideoPlayer key={peers[10]?.peerID} peer={peers[10]?.peer} user={peers[10]?.userName} />
                  </div>
                )}
                {/* Display remaining users count */}
                {peers.length > (isMobile ? 2 : 11) && (
                  <div className="remaining-users">
                    {peers.length - (isMobile ? 2 : 11)} more users
                  </div>
                )}
            </div>
        </div>
      
          {showSidePanel && (
            <div className="utils">
              <SidePanel
                people={peers}
                showSidePanel={showSidePanel}
                sendMessage={sendMessage}
                sendFile={sendFile}
                messages={messages}
                user={user}
              />
            </div>
          )}
      </div>
    );    
  }
};

export default Room;
