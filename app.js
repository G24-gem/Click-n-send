const WebSocket = require("ws");
const express = require("express");
const http = require("http");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server }); // Production

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create 'chathouse' folder if not exists
if (!fs.existsSync("./chathouse")) {
  fs.mkdirSync("./chathouse");
}

// Handle new connections
wss.on("connection", (ws) => {
  console.log("🔌 Client connected");

  // Send chat messages immediately
  sendMessages(ws);

  // Poll and send messages to this client every second
  const intervalId = setInterval(() => {
    sendMessages(ws);
  }, 1000);

  // When client sends a message
  ws.on("message", (message) => {
    try {
      const msg = message.toString("utf8");
      const { messageContent: content, time: filename } = JSON.parse(msg);

      fs.writeFile(path.join("chathouse", filename), content, (err) => {
        if (err) console.error("❌ File write error:", err);
      });

    } catch (err) {
      console.error("❌ Invalid message:", err.message);
    }
  });

  // When client disconnects
  ws.on("close", () => {
    console.log("❌ Client disconnected");
    clearInterval(intervalId);
    broadcastUserCount();
  });

  // Broadcast current user count after connection established
  broadcastUserCount();
});

// Broadcast number of online users to all clients
function broadcastUserCount() {
  const clients = [...wss.clients].filter(client => client.readyState === WebSocket.OPEN);
  const count = clients.length;
  const msg = `USERS:${count}`;

  clients.forEach(client => {
    client.send(msg);
  });

  console.log(`📡 Broadcasted user count: ${count}`);
}

// Function to send all messages to a specific client
async function sendMessages(ws) {
  try {
    const files = await fsPromises.readdir("./chathouse");
    const messages = await Promise.all(
      files.map(file => fsPromises.readFile(path.join("chathouse", file), "utf8"))
    );

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(messages.join("|"));
    }
  } catch (err) {
    console.error("❌ Error sending messages:", err.message);
  }
}

// Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

