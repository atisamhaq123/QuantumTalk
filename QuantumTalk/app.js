const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files
app.use(express.static(path.join(__dirname, '')));

// Store connected users and their IDs
const connectedUsers = {};
const names={};
// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Generate a unique ID for the connected user
 // const userId = uuidv4();
  connectedUsers[socket.id] = socket.id;

  
  // Send the assigned user ID to the connected client
  socket.emit('userId', socket.id);
  
  io.emit('userList', Object.keys(connectedUsers));
  socket.on("sendname",function(nameX){
    names[socket.id]=nameX;
    socket.emit('receiveName', nameX);
    io.emit('SetNames', names)
  });

  
  // Handle private messages
  socket.on('privateMessage', (data) => {
    // Check if the receiver ID exists in connectedUsers
    if (data.receiverId in connectedUsers) {
      const receiverSocketId = connectedUsers[data.receiverId];
      // Emit the private message event to the receiver
      io.to(receiverSocketId).emit('privateMessage', {
        "senderId": socket.id,
        "message": data.message,
        "name":names[socket.id]
      });
    } else {
      // Receiver ID not found
      socket.emit('errorMessage', 'Receiver ID not found');
    }
  });
  //Like the message
  socket.on('likeit', (data) => {
    io.emit('likeitNow', data)
  });
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    // Remove the user ID from connectedUsers
    delete connectedUsers[socket.id];
    io.emit('disconnected', socket.id);
  });

    socket.on("U_message", (data) => {
      socket.emit('Get_U_message', {
        "senderId": data.receiverId,
        "message": data.message,
        "mine":true
        });
    });

    
});

// Start the server
const port = process.env.PORT || 2500;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
