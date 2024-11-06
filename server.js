const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let countdownTime = 0; // Kezdeti idő másodpercekben

// A Socket.IO kapcsolat figyelése
io.on('connection', (socket) => {
    console.log('Új kliens csatlakozott');

    // Az aktuális visszaszámlálási idő küldése
    socket.emit('updateCountdown', countdownTime);

    // A visszaszámláló beállítása
    socket.on('setCountdown', (timeInSeconds) => {
        countdownTime = timeInSeconds;
        io.emit('updateCountdown', countdownTime); // Frissítés minden kliensnek
    });
});

// Statikus fájlok kiszolgálása a "public" mappából
app.use(express.static('public'));

// A szerver elindítása
server.listen(3000, () => {
    console.log('Szerver fut a 3000-es porton');
});

// Másodpercenként csökkenti az időt, ha a visszaszámlálás elindult
setInterval(() => {
    if (countdownTime > 0) {
        countdownTime--;
        io.emit('updateCountdown', countdownTime); // Frissítés minden kliensnek
    }
}, 1000);
