const webrtc = require('wrtc');

let senderStream;
let peers = {}; // To track connected peers for cleanup
let connectedUsers = []; // Array to track connected users

// Function to handle the /consumer route
async function handleConsumer({ body }, res) {
    const user = body.user; // Extract user information from the request body
    const peer = createPeer(user); // Pass the user object to createPeer
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    senderStream.getTracks().forEach(track => peer.addTrack(track, senderStream));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = { sdp: peer.localDescription };
    res.json(payload);
}

// Function to handle the /broadcast route
async function handleBroadcast({ body }, res) {
    const user = body.user; // Extract user information from the request body
    const peer = createPeer(user); // Pass the user object to createPeer
    peer.ontrack = (e) => handleTrackEvent(e, peer);
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = { sdp: peer.localDescription };

    res.json(payload);
}

// Create and track peer connection
function createPeer(user) {
    const peer = new webrtc.RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.stunprotocol.org" }]
    });

    const peerId = Date.now(); // Use a unique ID for tracking each peer
    peers[peerId] = peer;

    // Add user to the connected users list with user details
    connectedUsers.push({ 
        id: peerId,
        user_id : user.user_id,
        username: user.username, // Use the username from the user object
        email: user.email // Use the email from the user object
    });

    peer.oniceconnectionstatechange = () => {
        if (peer.iceConnectionState === 'disconnected' || peer.iceConnectionState === 'failed' || peer.iceConnectionState === 'closed') {
            closePeerConnection(peerId);
        }
    };

    return peer;
}

// Close peer connection and cleanup
function closePeerConnection(peerId) {
    if (peers[peerId]) {
        peers[peerId].close(); // Close the RTCPeerConnection
        delete peers[peerId]; // Remove peer from the tracking object
        connectedUsers = connectedUsers.filter(user => user.id !== peerId); // Remove user from the list
        console.log(`Connection with peer ${peerId} has been closed`);
    }
}

// Handle incoming media track event
function handleTrackEvent(e, peer) {
    senderStream = e.streams[0];
}

// Expose an endpoint to get connected users
function getConnectedUsers(req, res) {
    res.json(connectedUsers);
}

// Export the functions
module.exports = {
    handleConsumer,
    handleBroadcast,
    getConnectedUsers // Export this function
};
