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

  // Send previous messages once when they join
  sendMessageHistory(ws);

  // Add to count
  broadcastUserCount();

  ws.on("message", async (message) => {
  try {
    const msg = message.toString("utf8");
    const { messageContent: content, time: filename, isFinal } = JSON.parse(msg);

    // Format message as HTML
    const formatted = `<div class="chat-bubble">${content}</div>`;

    // Save formatted version
    await fsPromises.writeFile(path.join("chathouse", filename), formatted);

    if (isFinal) {
      broadcastNewMessage(formatted);
    }

  } catch (err) {
    console.error("❌ Error handling message:", err.message);
  }
});



  ws.on("close", () => {
    console.log("❌ Client disconnected");
    broadcastUserCount();
  });
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

// Helper function for sending new messages
function broadcastNewMessage(message) {
  const clients = [...wss.clients].filter(ws => ws.readyState === WebSocket.OPEN);
  const msg = `NEW:${message}`;
  clients.forEach(client => client.send(msg));
}



// Function to send all messages to a specific client
async function sendMessageHistory(ws) {
  try {
    const files = await fsPromises.readdir("./chathouse");
    const messages = await Promise.all(
      files.map(file => fsPromises.readFile(path.join("chathouse", file), "utf8"))
    );

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(`HISTORY:${messages.join("|")}`);
    }
  } catch (err) {
    console.error("❌ Error sending history:", err.message);
  }
}


// Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

