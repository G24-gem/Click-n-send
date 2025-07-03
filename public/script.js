const inputElem = document.querySelector(".input");
const submitElem = document.querySelector(".post-btn");
const chatCanvas = document.querySelector(".post-container");
const onlineCountElem = document.getElementById("online-count");

const ws = new WebSocket(`wss://${location.host}`); // Deployment
// const ws = new WebSocket("ws://localhost:7700"); // Testing

let timestamp = new Date().toISOString().replace(/:/g, "-");
let lastValue = "";

// 📡 Poll input every 300ms for mobile compatibility
setInterval(() => {
  const currentValue = inputElem.value;
  if (currentValue !== lastValue) {
    lastValue = currentValue;
    const msg = JSON.stringify({ messageContent: currentValue, time: timestamp });
    ws.send(msg);
  }
}, 300);

// 🧹 Reset input & timestamp when "Post" button is clicked
submitElem.addEventListener("click", () => {
  inputElem.value = "";
  lastValue = "";
  timestamp = new Date().toISOString().replace(/:/g, "-");
});

// 📩 Append one message to screen
function appendMessage(msg) {
  const div = document.createElement("div");
  div.id = "mess";
  div.innerHTML = msg;
  chatCanvas.appendChild(div);
  chatCanvas.scrollTop = chatCanvas.scrollHeight;
}

// 🌐 Handle WebSocket messages
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
    messages.forEach(appendMessage);
    return;
  }

  if (data.startsWith("NEW:")) {
    const newMsg = data.replace("NEW:", "");
    appendMessage(newMsg);
    return;
  }

  // fallback (in case old format somehow comes)
  if (data.includes("|")) {
    chatCanvas.innerHTML = "";
    const msgArrLocal = data.split("|");
    msgArrLocal.forEach(appendMessage);
  }
};
