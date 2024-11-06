const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let countdownTime = 0; // Visszaszámlálási idő másodpercben
let countdownInterval; // Visszaszámláló intervallum
let isRunning = false; // Állapot jelzése, hogy a visszaszámláló fut-e

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
        isRunning = true; // Állapot beállítása futásra

        // Új visszaszámláló intervallum beállítása
        countdownInterval = setInterval(() => {
            if (countdownTime > 0 && isRunning) {
                countdownTime--;
                io.emit("updateCountdown", countdownTime); // Minden kliens frissítése másodpercenként
            } else if (countdownTime === 0) {
                clearInterval(countdownInterval); // Visszaszámlálás leállítása, ha elérte a nullát
            }
        }, 1000);
    });

    // Visszaszámlálás megállítása
    socket.on("stopCountdown", () => {
        isRunning = false; // Állapot beállítása megállásra
        clearInterval(countdownInterval);
        io.emit("updateCountdown", countdownTime); // Frissített visszaszámlálási idő elküldése minden kliensnek
    });

    // Visszaszámlálás folytatása
    socket.on("resumeCountdown", () => {
        isRunning = true; // Állapot beállítása futásra

        // Új visszaszámláló intervallum beállítása
        countdownInterval = setInterval(() => {
            if (countdownTime > 0 && isRunning) {
                countdownTime--;
                io.emit("updateCountdown", countdownTime); // Minden kliens frissítése másodpercenként
            } else if (countdownTime === 0) {
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
    console.log("Szerver fut a 3000-es porton"); });
