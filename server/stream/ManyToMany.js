const io = require("socket.io");
const socket = require("socket.io");

function initializeManyToMany(server){
    const io = socket(server, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
        },
      });
    const usersList = []; // to store all users connected including their names and ids

    io.on("connection", (socket) => {
        socket.on("b-join room", ({ roomID, userName }) => {
            let index = usersList.findIndex((user) => user.id === socket.id);
            if (index === -1) {
            // get all users in the room
            const usersInRoom = io.sockets.adapter.rooms.get(roomID);
            let users = [];
            if (usersInRoom) {
                // if there are any users present
                usersInRoom.forEach((u) => {
                // get the user object from the userList array using the id of the user in the usersInRoom array
                const user = usersList.find((user) => user.id === u);
                if (user) {
                    users.push(user);
                }
                });
        
                socket.emit("f-users joined", users);
            } else {
                io.to(roomID).emit("f-users joined", users);
            }
        
            let newUser = {
                id: socket.id,
                userName,
                roomID,
            };
            usersList.push(newUser);
            socket.join(roomID);
            }
        });
        
        socket.on(
            "b-request connect",
            ({ userToConnect, from, signal, userName }) => {
            io.to(userToConnect).emit("f-get request", {
                signal: signal,
                from: from,
                userName,
            });
            }
        );
        
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
