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

  if (data.startsWith("USERS:")) {
    const count = data.split(":")[1];
    onlineCountElem.textContent = `Online: ${count}`;
    return;
  }

  if (data.startsWith("HISTORY:")) {
    chatCanvas.innerHTML = "";
    const messages = data.replace("HISTORY:", "").split("|");
    messages.forEach((msg) => appendMessage(msg));
    return;
  }

  if (data.startsWith("NEW:")) {
    const newMsg = data.replace("NEW:", "");
    appendMessage(newMsg);
    return;
  }
};

// 🧱 Helper to append message
function appendMessage(msg) {
  const div = document.createElement("div");
  div.id = "mess";
  div.innerHTML = msg;
  chatCanvas.appendChild(div);
  chatCanvas.scrollTop = chatCanvas.scrollHeight;
}




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
