const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const jwt = require("jsonwebtoken");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const SECRET_KEY = "supersecretkey";
const ADMIN_USER = { username: "admin", password: "password123" };

let countdownTime = 0;
let countdownInterval;

app.use(express.json());

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    
    if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
        return res.json({ token });
    } else {
        return res.status(401).json({ message: "Hibás felhasználónév vagy jelszó" });
    }
});

function authenticateToken(socket, next) {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Hitelesítés szükséges"));

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return next(new Error("Érvénytelen token"));
        socket.user = user;
        next();
    });
}

io.use(authenticateToken);

io.on("connection", (socket) => {
    socket.emit("updateCountdown", countdownTime);

    socket.on("setCountdown", (time) => {
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
    });

    socket.on("stopCountdown", () => {
        clearInterval(countdownInterval);
        io.emit("updateCountdown", countdownTime);
    });

    socket.on("resumeCountdown", () => {
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
    });
});

app.use(express.static(path.join(__dirname)));

server.listen(3000, () => {
    console.log("Szerver fut a 3000-es porton");
});
