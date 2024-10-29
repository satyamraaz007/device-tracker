const express = require("express");
const app = express();
const http = require("http");
const path = require("path");

// Initiating Socket server
const socketio = require("socket.io");
const server = http.createServer(app);
const io = socketio(server);

// setting up ejs
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")))

// Getting the socket connection
io.on("connection", function(socket) {
    socket.on("send-location", function(data) {
        io.emit("receive-location", {id: socket.id, ...data});
    })

    socket.on("disconnect", function() {
        io.emit("user-disconnected", socket.id);
    })
    // console.log("connected");
})

app.get("/", (req, res) => {
    res.render("index");
})

server.listen(5000)