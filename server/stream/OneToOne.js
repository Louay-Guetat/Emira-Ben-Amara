const io = require("socket.io");

function initializeOneToOne(server) {
  const socketServer = io(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    }
  });

  // Object to keep track of users in rooms
  const usersInRooms = {};
  
  socketServer.on("connection", (socket) => {
    socket.emit("me", socket.id);

    // Handle joining a room
    socket.on("joinRoom", (roomId, username) => {
      socket.join(roomId);
    
      if (!usersInRooms[roomId]) {
        usersInRooms[roomId] = [];
      }
    
      if (usersInRooms[roomId].length >= 2) {
        socket.emit("roomFull", { message: "This room is already full." });
        socket.leave(roomId); 
        console.log('hello')
        return;
      }
    
      if (!usersInRooms[roomId].includes(socket.id)) {
        usersInRooms[roomId].push(socket.id);
      }
    
      // Check if another user is already in the same room
      if (usersInRooms[roomId].length === 2) { // Changed to `=== 2` to indicate full
        const otherUserId = usersInRooms[roomId].find(id => id !== socket.id);
    
        // Notify the other user that someone is calling
        socketServer.to(otherUserId).emit("callUser", {
          signalData: null,  // Initial signaling will be handled in the client
          from: socket.id,
          name: username,  // Username of the calling user
        });
    
        // Notify the caller as well
        socket.emit("callUser", {
          signalData: null,  // Initial signaling will be handled in the client
          from: otherUserId,
          name: "Other User",  // Replace with actual name if available
        });
      } else {
        console.log(`User ${socket.id} has joined room ${roomId}`);
      }
    
      console.log(usersInRooms);
    });
    
    // Handle disconnection
    socket.on("disconnect", () => {
      socket.broadcast.emit("callEnded");

      // Remove user from the rooms
      Object.keys(usersInRooms).forEach((roomId) => {
        const index = usersInRooms[roomId].indexOf(socket.id);
        if (index !== -1) {
          usersInRooms[roomId].splice(index, 1);

          if (usersInRooms[roomId].length === 0) {
            delete usersInRooms[roomId];
          }
        }
      });

      console.log(`User ${socket.id} disconnected`);
      console.log(usersInRooms);
    });

    // Handle a user calling another user
    socket.on("callUser", (data) => {
      const roomId = Object.keys(usersInRooms).find(id => usersInRooms[id].includes(socket.id));
    
      if (roomId) {
        const usersInRoom = usersInRooms[roomId];
        const otherUserId = usersInRoom.find(id => id !== socket.id);
    
        if (otherUserId) {
          // Notify the other user that they're receiving a call
          socketServer.to(otherUserId).emit("receivingCall", {
            signal: data.signalData,
            from: socket.id,
            name: data.name,
          });
        } else {
          console.log("No other user in the room to call.");
        }
      } else {
        console.log("User is not in any room.");
      }
    });
    

    // Handle answering a call
    socket.on("answerCall", (data) => {
      socketServer.to(data.to).emit("callAccepted", data.signal);
    });
  });
}

module.exports = initializeOneToOne;
