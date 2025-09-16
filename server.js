const express = require("express");
const path = require("path");
const WebSocket = require("ws");
const http = require("http");

const app = express();
const server = http.createServer(app);

// serve index.html
app.use(express.static(path.join(__dirname)));

// websocket server
const wss = new WebSocket.Server({ server });

wss.on("connection", socket => {
  socket.on("message", message => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
