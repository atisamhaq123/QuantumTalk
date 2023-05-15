var express = require('express');
var http = require('http');

var app = express();
var server = http.createServer(app);

var io = require('socket.io')(server);
var path = require('path');


app.use(express.static(path.join(__dirname,'./')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});


var name;


io.on('connection', (socket) => {
  console.log('new user connected');
  
  socket.on('joining msg', (username) => {
  	name = username;
  
  	io.emit('chatmessage', `---${name} joined the chat---@@1`);
   
    
 
  });
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
    io.emit('chatmessage', `---${name} left the chat---`);
    
  });
  socket.on('chatmessage', (msg) => {
    socket.broadcast.emit('chatmessage', msg);         //sending message to all except the sender
  });
  socket.on('reaction', (id) => {
    io.emit('reaction', id);
         
  });


});

server.listen(3000, () => {
  console.log('Server listening on :3000');
});
