const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let countdownTime = 0; // Kezdeti idő másodpercekben

io.on('connection', (socket) => {
    console.log('Új kliens csatlakozott');

    // Küldd el az aktuális visszaszámlálást
    socket.emit('updateCountdown', countdownTime);

    // Figyeld a visszaszámlálás beállítását
    socket.on('setCountdown', (time) => {
        countdownTime = time;
        io.emit('updateCountdown', countdownTime); // Frissítés minden kliensnek
    });
});

// Statikus fájlok kiszolgálása
app.use(express.static('public'));

server.listen(3000, () => {
    console.log('Szerver fut a 3000-es porton');
});
