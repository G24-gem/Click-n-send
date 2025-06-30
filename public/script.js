const inputElem = document.querySelector(".input");
const submitElem = document.querySelector(".post-btn");
const chatCanvas = document.querySelector(".post-container");
const onlineCountElem = document.getElementById("online-count");


const ws = new WebSocket(`wss://${location.host}`); // Deployment
// const ws = new WebSocket("ws://localhost:7700"); // Testing

let timestamp = new Date().toISOString().replace(/:/g, "-");
let lastValue = "";

// Incoming messages from server
ws.onmessage = (message) => {
  const data = message.data;

  // Handle online count message
  if (data.startsWith("USERS:")) {
    const count = data.split(":")[1];
    onlineCountElem.textContent = `Online: ${count}`;
    return;
  }

  // Normal message render
  chatCanvas.innerHTML = "";
  const msgArrLocal = data.split("|");
  msgArrLocal.forEach((item) => {
    const div = document.createElement("div");
    div.id = "mess";
    div.innerHTML = item;
    chatCanvas.appendChild(div);
  });
  chatCanvas.scrollTop = chatCanvas.scrollHeight;
};


// 🧠 Function to send message
function sendMessage(value) {
  const msg = JSON.stringify({ messageContent: value, time: timestamp });
  ws.send(msg);
}

// 🔁 Poll input changes every 300ms
setInterval(() => {
  const currentValue = inputElem.value;
  if (currentValue !== lastValue) {
    lastValue = currentValue;
    sendMessage(currentValue);
  }
}, 300);

// ✅ Clear input on click
submitElem.addEventListener("click", () => {
  inputElem.value = "";
  lastValue = ""; // reset tracker
  timestamp = new Date().toISOString().replace(/:/g, "-");
});
