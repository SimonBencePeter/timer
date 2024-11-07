const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const validCredentials = {
    username: "admin",
    password: "admin123"
};

let countdownTime = 0;
let countdownInterval;

io.on("connection", (socket) => {
    console.log("Új kliens csatlakozott");
    socket.emit("updateCountdown", countdownTime);
    
    // Bejelentkezés kezelése
    socket.on("authenticate", (credentials) => {
        if (credentials.username === validCredentials.username && credentials.password === validCredentials.password) {
            socket.authenticated = true; // Beállítjuk a hitelesítést
            socket.emit("authenticated");
        } else {
            socket.emit("authenticationFailed");
        }
    });

    // Visszaszámlálás beállítása, ha hitelesítve van
    socket.on("setCountdown", (time) => {
        if (socket.authenticated) {  // Ellenőrizzük, hogy be van-e jelentkezve
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
        }
    });

    // Stop és Resume logika
    socket.on("stopCountdown", () => {
        if (socket.authenticated) {
            clearInterval(countdownInterval);
            io.emit("updateCountdown", countdownTime);
        }
    });

    socket.on("resumeCountdown", () => {
        if (socket.authenticated) {
            countdownInterval = setInterval(() => {
                if (countdownTime > 0) {
                    countdownTime--;
                    io.emit("updateCountdown", countdownTime);
                } else {
                    clearInterval(countdownInterval);
                }
            }, 1000);
        }
    });

    socket.on("disconnect", () => {
        console.log("Kliens lecsatlakozott");
    });
});

server.listen(3000, () => {
    console.log("Szerver fut a 3000-es porton");
});
