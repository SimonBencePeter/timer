const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let countdownTime = 0; // Visszaszámlálási idő másodpercekben

// Üzenet küldése minden kliensnek, amikor a visszaszámlálás változik
io.on("connection", (socket) => {
    console.log("Új kliens csatlakozott");

    // Kezdeti visszaszámlálási idő küldése az új kliensnek
    socket.emit("updateCountdown", countdownTime);

    // Idő beállítása
    socket.on("setCountdown", (time) => {
        countdownTime = time;
        io.emit("updateCountdown", countdownTime); // Frissítés minden kliensnek
    });

    socket.on("disconnect", () => {
        console.log("Kliens lecsatlakozott");
    });
});

// Másodpercenként csökkenti az időt, ha a visszaszámlálás elindult
setInterval(() => {
    if (countdownTime > 0) {
        countdownTime--;
        io.emit("updateCountdown", countdownTime); // Frissítés minden kliensnek
    }
}, 1000);

// Egyszerű weboldal kiszolgálása
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

server.listen(3000, () => {
    console.log("Szerver fut a 3000-es porton");
});
