const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const jwt = require("jsonwebtoken");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let countdownTime = 0;
let countdownInterval;
const adminPassword = "admin"; // Állítsd be itt az admin jelszót
const jwtSecret = "!!!!!!!!!!"; // Generálj egy erős titkos kulcsot

io.on("connection", (socket) => {
    console.log("Új kliens csatlakozott");

    // Kezdeti visszaszámlálási idő küldése minden csatlakozott kliensnek
    socket.emit("updateCountdown", countdownTime);

    // Hitelesítés fogadása
    socket.on("authenticate", (password) => {
        if (password === adminPassword) {
            const token = jwt.sign({ role: "admin" }, jwtSecret);
            socket.emit("authenticated", token);
        } else {
            socket.emit("authenticationFailed");
        }
    });

    // Visszaszámlálási idő beállítása csak hitelesített admin számára
    socket.on("setCountdown", (time, token) => {
        try {
            jwt.verify(token, jwtSecret);
            countdownTime = time;
            clearInterval(countdownInterval);
            io.emit("updateCountdown", countdownTime);

            countdownInterval = setInterval(() => {
                if (countdownTime > 0) {
                    countdownTime--;
                    io.emit("updateCountdown", countdownTime);
                } else {
                    clearInterval(countdownInterval);
                }
            }, 1000);
        } catch (error) {
            socket.emit("unauthorized");
        }
    });

    socket.on("stopCountdown", (token) => {
        try {
            jwt.verify(token, jwtSecret);
            clearInterval(countdownInterval);
            io.emit("updateCountdown", countdownTime);
        } catch (error) {
            socket.emit("unauthorized");
        }
    });

    socket.on("resumeCountdown", (token) => {
        try {
            jwt.verify(token, jwtSecret);
            io.emit("updateCountdown", countdownTime);
            countdownInterval = setInterval(() => {
                if (countdownTime > 0) {
                    countdownTime--;
                    io.emit("updateCountdown", countdownTime);
                } else {
                    clearInterval(countdownInterval);
                }
            }, 1000);
        } catch (error) {
            socket.emit("unauthorized");
        }
    });

    socket.on("disconnect", () => {
        console.log("Kliens lecsatlakozott");
    });
});

app.use(express.static(path.join(__dirname)));

server.listen(3000, () => {
    console.log("Szerver fut a 3000-es porton");
});
