const io = require("socket.io");
const socket = require("socket.io");
const pool = require('../database/db');

// Use the provided isStreamIdAllowed function to check if the roomID (streamID) is allowed
async function isStreamIdAllowed(streamId) {
    const allowedStreamIds = await getAllowedStreamIdsFromDatabase();
    return allowedStreamIds.includes(streamId);
}

// Function to get the allowed stream IDs from the database
async function getAllowedStreamIdsFromDatabase() {
    return new Promise((resolve, reject) => {
        pool.execute(
            "SELECT event_link FROM events ORDER BY date_event ASC LIMIT 1",
            (err, result) => {
                if (err) {
                    return reject(err);
                }
                if (result.length > 0) {
                    resolve([result[0].event_link]);
                } else {
                    resolve([]);
                }
            }
        );
    });
}

function initializeManyToMany(server) {
    const io = socket(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    const usersList = []; // Store all connected users with their names and ids

    io.on("connection", (socket) => {
        socket.on("b-join room", async ({ roomID, userName }) => {
            // Validate roomID using isStreamIdAllowed function
            const isRoomValid = await isStreamIdAllowed(roomID);
            console.log(isRoomValid)
            if (!isRoomValid) {
                socket.emit("error", "Room ID is not valid");
                return; // Stop further processing
            }

            // Get users in the room and check if there are fewer than 100 users
            const usersInRoom = io.sockets.adapter.rooms.get(roomID);
            const userCount = usersInRoom ? usersInRoom.size : 0;

            if (userCount >= 100) {
                socket.emit("error", "Room is full. Maximum of 100 users allowed.");
                return; // Stop further processing
            }

            // Check if user already exists in usersList
            let index = usersList.findIndex((user) => user.id === socket.id);
            if (index === -1) {
                // Get all users currently in the room
                let users = [];
                if (usersInRoom) {
                    usersInRoom.forEach((u) => {
                        const user = usersList.find((user) => user.id === u);
                        if (user) {
                            users.push(user);
                        }
                    });
                    socket.emit("f-users joined", users);
                } else {
                    io.to(roomID).emit("f-users joined", users);
                }

                // Add the new user to the usersList
                let newUser = {
                    id: socket.id,
                    userName,
                    roomID,
                };
                usersList.push(newUser);
                socket.join(roomID);
            }
        });

        socket.on("b-request connect", ({ userToConnect, from, signal, userName }) => {
            io.to(userToConnect).emit("f-get request", {
                signal: signal,
                from: from,
                userName,
            });
        });

        socket.on("b-accept connect", ({ from, signal }) => {
            io.to(from).emit("f-accepted connect", {
                signal: signal,
                id: socket.id,
            });
        });

        socket.on("b-send message", ({ message, roomID, userName, time }) => {
            io.to(roomID).emit("f-receive message", { message, userName, time });
        });

        socket.on("b-send file", ({ roomID, body }) => {
            io.to(roomID).emit("f-recieve file", body);
        });

        socket.on("b-send sound", ({ roomID, target }) => {
            io.to(roomID).emit("f-recieve sound", target);
        });

        socket.on("disconnect", () => {
            const userIdx = usersList.findIndex((user) => user.id === socket.id);
            if (userIdx !== -1) {
                socket.leave(usersList[userIdx].roomID);
                usersList.splice(userIdx, 1);

                socket.broadcast.emit("user left", socket.id);
            }
        });
    });
}

module.exports = initializeManyToMany;
