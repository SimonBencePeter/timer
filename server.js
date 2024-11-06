const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let countdownEndTime = null;

app.get('/setCountdown', (req, res) => {
    const { seconds } = req.query;
    countdownEndTime = Date.now() + seconds * 1000;
    io.emit('countdown', countdownEndTime);
    res.send({ message: 'Countdown set' });
});

io.on('connection', (socket) => {
    if (countdownEndTime) {
        socket.emit('countdown', countdownEndTime);
    }
});

server.listen(3000, () => console.log('Server is running on port 3000'));
