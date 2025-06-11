const WebSocket = require("ws");
const express = require("express");
const http = require("http");
const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create chathouse folder if not exists
if (!fs.existsSync("./chathouse")) {
  fs.mkdirSync("./chathouse");
}

// WebSocket logic
wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const msg = message.toString("utf8");
    const [content, filename] = msg.split(",");

    fs.writeFile(path.join("chathouse", filename), content, (err) => {
      if (err) console.error(err);
    });

    console.log("Received:", msg);
  });

  async function send() {
    try {
      const files = await fsPromises.readdir("./chathouse");
      const filesCon = await Promise.all(
        files.map(file => fsPromises.readFile(path.join("chathouse", file), "utf8"))
      );

      if (ws.readyState === WebSocket.OPEN) {
        ws.send(filesCon.join("|"));
      }
    } catch (err) {
      console.error(err);
    }
  }

  send();
  setInterval(send, 1000);
});

// Start combined HTTP + WebSocket server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
