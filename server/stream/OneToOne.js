const io = require("socket.io");

function initializeOneToOne(server) {
  const socketServer = io(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    }
  });

  socketServer.on("connection", (socket) => {
    // Send the socket ID to the client
    socket.emit("me", socket.id);

    // Handle disconnection
    socket.on("disconnect", () => {
      socket.broadcast.emit("callEnded");
    });

    // Handle a user calling another user
    socket.on("callUser", (data) => {
      socketServer.to(data.userToCall).emit("callUser", {
        signal: data.signalData,
        from: data.from,
        name: data.name
      });
    });

    // Handle answering a call
    socket.on("answerCall", (data) => {
      socketServer.to(data.to).emit("callAccepted", data.signal);
    });
  });
}

// Export the initialization function
module.exports = initializeOneToOne;
