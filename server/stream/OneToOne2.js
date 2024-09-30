const webrtc = require('wrtc');
const pool = require('../database/db');

let senderStream;
let peers = {};
let connectedUsers = [];
let chat = [];
const MAX_USERS = 2;

async function isStreamIdAllowed(streamId) {
    const allowedStreamIds = await getAllowedStreamIdsFromDatabase();
    return allowedStreamIds.includes(streamId);
}

async function getAllowedStreamIdsFromDatabase() {
    return new Promise((resolve, reject) => {
        pool.execute(
            "SELECT appointement_link FROM appointments ORDER BY start_date ASC LIMIT 1",
            (err, result) => {
                if (err) {
                    return reject(err);
                }
                if (result.length > 0) {
                    resolve([result[0].appointement_link]);
                } else {
                    resolve([]);
                }
            }
        );
    });
}

async function handleConsumer({ body }, res) {
    const user = body.user;
    // Check if the stream ID is allowed
    if (!(await isStreamIdAllowed(body.streamId))) {
        return res.status(205).json({ error: 'Stream ID not authorized' });
    }

    const peer = createPeer(user);
    if (!peer) {
        return res.status(403).json({ error: 'Maximum number of users reached' });
    }

    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    senderStream.getTracks().forEach(track => peer.addTrack(track, senderStream));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = { sdp: peer.localDescription };
    const dataChannel = peer.createDataChannel("chat");
    setupDataChannel(dataChannel);

    res.json(payload);
}

async function handleBroadcast({ body }, res) {
    const user = body.user;

    // Check if the stream ID is allowed
    if (!(await isStreamIdAllowed(body.streamId))) {
        return res.status(205).json({ error: 'Stream ID not authorized' });
    }

    const peer = createPeer(user);
    if (!peer) {
        return res.status(403).json({ error: 'Maximum number of users reached' });
    }

    peer.ontrack = (e) => handleTrackEvent(e, peer);
    const desc = new webrtc.RTCSessionDescription(body.sdp);
    await peer.setRemoteDescription(desc);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    const payload = { sdp: peer.localDescription };
    const dataChannel = peer.createDataChannel("chat");
    setupDataChannel(dataChannel);

    res.json(payload);
}

function createPeer(user) {
    if (connectedUsers.length >= MAX_USERS) {
        console.log('Maximum number of users reached, cannot add more users.');
        return null;
    }

    const peer = new webrtc.RTCPeerConnection({
        iceServers: [{ urls: "stun:stunprotocol.org" }]
    });

    const dataChannel = peer.createDataChannel("chat");
    setupDataChannel(dataChannel);

    const peerId = Date.now();
    peers[peerId] = { peer, dataChannel };

    connectedUsers.push({
        id: peerId,
        user_id: user.user_id,
        username: user.username,
        email: user.email
    });

    peer.oniceconnectionstatechange = () => {
        if (peer.iceConnectionState === 'disconnected' || peer.iceConnectionState === 'failed' || peer.iceConnectionState === 'closed') {
            closePeerConnection(peerId);
        }
    };

    return peer;
}

function setupDataChannel(dataChannel) {
    dataChannel.onopen = () => {
        console.log("Data channel is open");
    };

    dataChannel.onmessage = (event) => {
        const message = JSON.parse(event.data);
        chat.push(message);
        broadcastMessage(message);
    };
}

function broadcastMessage(message) {
    for (const peerId in peers) {
        if (peers[peerId].dataChannel.readyState === "open") {
            peers[peerId].dataChannel.send(JSON.stringify(message));
        }
    }
}

function closePeerConnection(peerId) {
    if (peers[peerId]) {
        peers[peerId].peer.close();
        delete peers[peerId];
        connectedUsers = connectedUsers.filter(user => user.id !== peerId);
        console.log(`Connection with peer ${peerId} has been closed`);
    }
}

function handleTrackEvent(e, peer) {
    senderStream = e.streams[0];
}

function getConnectedUsers(req, res) {
    res.json(connectedUsers);
}

function sendMessage({ body }, res) {
    const message = { username: body.username, message: body.message };
    chat.push(message);
    broadcastMessage(message);
    res.json({ status: 'Message sent' });
}

module.exports = {
    handleConsumer,
    handleBroadcast,
    closePeerConnection,
    getConnectedUsers,
    sendMessage
};
