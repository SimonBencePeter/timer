const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let countdownTime = 0; // Visszaszámlálási idő másodpercben
let countdownInterval; // Visszaszámláló intervallum

// Bejövő socket kapcsolatok kezelése
io.on("connection", (socket) => {
    console.log("Új kliens csatlakozott");

    // Kezdeti visszaszámlálási idő küldése az új kliensnek
    socket.emit("updateCountdown", countdownTime);

    // Visszaszámlálási idő beállítása a kliens által küldött érték alapján
    socket.on("setCountdown", (time) => {
        countdownTime = time;
        clearInterval(countdownInterval); // Előző visszaszámláló intervallum törlése, ha van
        io.emit("updateCountdown", countdownTime); // Frissített visszaszámlálási idő elküldése minden kliensnek

        // Új visszaszámláló intervallum beállítása
        countdownInterval = setInterval(() => {
            if (countdownTime > 0) {
                countdownTime--;
                io.emit("updateCountdown", countdownTime); // Minden kliens frissítése másodpercenként
            } else {
                clearInterval(countdownInterval); // Visszaszámlálás leállítása, ha elérte a nullát
            }
        }, 1000);
    });

    // Visszaszámlálás megállítása
    socket.on("stopCountdown", () => {
        clearInterval(countdownInterval); // Aktív visszaszámláló intervallum törlése
        io.emit("updateCountdown", countdownTime); // Frissített visszaszámlálási idő elküldése minden kliensnek
    });

    // Visszaszámlálás folytatása
    socket.on("resumeCountdown", () => {
        clearInterval(countdownInterval); // Előző visszaszámláló intervallum törlése, ha van
        io.emit("updateCountdown", countdownTime); // Frissített visszaszámlálási idő elküldése minden kliensnek
        countdownInterval = setInterval(() => {
            if (countdownTime > 0) {
                countdownTime--;
                io.emit("updateCountdown", countdownTime); // Minden kliens frissítése másodpercenként
            } else {
                clearInterval(countdownInterval); // Visszaszámlálás leállítása, ha elérte a nullát
            }
        }, 1000);
    });

    // Kapcsolat bontása kezelése
    socket.on("disconnect", () => {
        console.log("Kliens lecsatlakozott");
    });
});

// Statikus fájlok kiszolgálása (pl. az index.html fájl)
app.use(express.static(path.join(__dirname)));

// Szerver indítása
server.listen(3000, () => {
    console.log("Szerver fut a 3000-es porton");
});
