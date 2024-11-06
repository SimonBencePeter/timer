const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let countdownTime = 0; // Visszaszámlálási idő másodpercben

// Bejövő socket kapcsolatok kezelése
io.on("connection", (socket) => {
    console.log("Új kliens csatlakozott");

    // Kezdeti visszaszámlálási idő küldése az új kliensnek
    socket.emit("updateCountdown", countdownTime);

    // Visszaszámlálási idő beállítása a kliens által küldött érték alapján
    socket.on("setCountdown", (time) => {
        countdownTime = time;
        io.emit("updateCountdown", countdownTime); // Frissített visszaszámlálási idő elküldése minden kliensnek
    });

    // Kapcsolat bontása kezelése
    socket.on("disconnect", () => {
        console.log("Kliens lecsatlakozott");
    });
});

// Statikus fájlok kiszolgálása (pl. az index.html fájl)
app.use(express.static('public')); // Győződj meg róla, hogy az index.html a 'public' mappában van

// Szerver indítása
server.listen(3000, () => {
    console.log("Szerver fut a 3000-es porton");
});

// Visszaszámláló logika
setInterval(() => {
    if (countdownTime > 0) {
        countdownTime--;
        io.emit("updateCountdown", countdownTime); // Minden kliens frissítése másodpercenként
    }
}, 1000);
