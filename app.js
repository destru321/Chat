const express = require('express');
const http = require('http');

const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server);

let users = [];

app.get('/', (req, res) => {
    res.send("OK");
});

app.get('/czat', (req, res) => {
    res.sendFile(__dirname + '/views/czat.html');
});

io.on('connection', (socket) => {
    console.log(`Klient się połączył na ID ${socket.id}`);
    const userObj = {
        socketID: socket.id
    };
    users.push(userObj);

    socket.on('new-user', ( userName ) => {
        const user = users.find( ({ socketID } ) => socketID === socket.id);
        user.userName = userName;
        io.to(socket.id).emit('czat-ready');
    });

    socket.on('chat-message', (message) => {
        const user = users.find( ({ socketID } ) => socketID === socket.id);
        io.emit('new-message', { author: user.userName, content: message });
    });

    socket.on('disconnect', () => {
        console.log('Klient się rozłączył!');
        users = users.filter( ({socketID}) => { return socketID != socket.id });
        console.log(users);
    })
})

server.listen(3000, () => { console.log("Serwer wystartował!"); });