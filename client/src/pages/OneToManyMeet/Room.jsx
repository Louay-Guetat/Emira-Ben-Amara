import React, { useEffect, useState, useRef } from 'react';
import useUser from "../../hooks/useUser";
import VideoStream from "./VideoStream";
import Viewer from "./Viewer";
import axios from 'axios';
import '../../scss/pages/OneToManyMeet/Room.scss';

const Room = () => {
    const { user } = useUser();
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [showUserList, setShowUserList] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [message, setMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const peerRef = useRef(null); // Use a ref for the peer connection
    const dataChannelRef = useRef(null)

    useEffect(() => {
        const fetchConnectedUsers = async () => {
            try {
                const response = await axios.get('/connected-users');
                setConnectedUsers(response.data);
            } catch (error) {
                console.error("Error fetching connected users:", error);
            }
        };

        const intervalId = setInterval(fetchConnectedUsers, 5000);
        return () => clearInterval(intervalId);
    }, []);

    const initializeDataChannel = (dataChannel) => {
        dataChannelRef.current = dataChannel;
    
        dataChannel.onmessage = (event) => {
            const message = JSON.parse(event.data);
            setChatMessages(prev => [...prev, message]); // Update chat messages in state
        };
    };   

    const filteredUsers = connectedUsers.filter(connectedUser => connectedUser.user_id !== user?.id && connectedUser.username !== 'Emira');
    const firstFiveUsers = filteredUsers.slice(0, 5);
    const remainingUsersCount = filteredUsers.length - 5;

    const toggleUserList = () => {
        setShowUserList(prev => !prev);
        setShowChat(false);
    };

    const toggleChat = () => {
        setShowChat(prev => !prev);
        setShowUserList(false);
    };

    // Modify sendChatMessage to ensure it's clear about handling messages
    const sendChatMessage = async () => {
        const messageData = { username: user.username, message };

        try {
            // Send message to the server
            await axios.post('/sendMessage', messageData); 
            setChatMessages(prev => [...prev, messageData]); // Update local chat messages
            setMessage('');

            // Send message via data channel if it's open
            if (peerRef.current && peerRef.current.dataChannel.readyState === 'open') {
                peerRef.current.dataChannel.send(JSON.stringify(messageData));
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // Ensure the data channel is correctly initialized and receives messages
    useEffect(() => {
        const peerConnection = new RTCPeerConnection(); // Your existing peer connection setup
        const dataChannel = peerConnection.createDataChannel("chat");

        // Store reference to the peer connection and data channel
        peerRef.current = { peerConnection, dataChannel };

        // Initialize data channel message handler
        dataChannel.onmessage = (event) => {
            const message = JSON.parse(event.data);
            setChatMessages(prev => [...prev, message]); // Update chat messages in state
        };

        return () => {
            peerConnection.close(); // Clean up on unmount
        };
    }, []);


    return (
        <div className='room'>
            <div className='main'>
                {user && user.role === 'admin' ? (
                    <VideoStream user={user} connectedUsers={connectedUsers} toggleChat={toggleChat} toggleUserList={toggleUserList} />
                ) : user && user.role !== 'admin' ? (
                    <Viewer user={user} connectedUsers={connectedUsers} toggleChat={toggleChat} toggleUserList={toggleUserList} />
                ) : null}

                <div className='users'>
                    {firstFiveUsers.map(user => (
                        <div key={user.id} className='user-container'>{user.username}</div>
                    ))}
                    {remainingUsersCount > 0 && (
                        <div className='user-container'>{`+${remainingUsersCount} more users`}</div>
                    )}
                </div>
            </div>

            {showUserList && (
                <div className="user-list">
                    <h2>Users</h2>
                    <ul>
                        {connectedUsers.length > 0 && connectedUsers.map((user) => (
                            <li key={user.id}>{user.username}</li>
                        ))}
                    </ul>
                </div>
            )}

            {showChat && (
                <div className="chat">
                    <h2>Chat</h2>
                    <div className="messages">
                        {chatMessages.map((msg, index) => (
                            <div key={index} className="message">
                                <strong>{msg.username}: </strong>{msg.message}
                            </div>
                        ))}
                    </div>
                    <div className='input-group'>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                        />
                        <button onClick={sendChatMessage}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Room;
