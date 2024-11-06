const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let countdownTime = 0; // Countdown time in seconds

// Handle incoming socket connections
io.on("connection", (socket) => {
    console.log("New client connected");

    // Send initial countdown time to the new client
    socket.emit("updateCountdown", countdownTime);

    // Set countdown time when received from the client
    socket.on("setCountdown", (time) => {
        countdownTime = time;
        io.emit("updateCountdown", countdownTime); // Emit the updated countdown time to all clients
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

// Serve static files (such as the index.html file)
app.use(express.static('public')); // Ensure your index.html is in the 'public' folder

// Start the server
server.listen(3000, () => {
    console.log("Server running on port 3000");
});

// Countdown timer logic
setInterval(() => {
    if (countdownTime > 0) {
        countdownTime--;
        io.emit("updateCountdown", countdownTime); // Update all clients every second
    }
}, 1000);
