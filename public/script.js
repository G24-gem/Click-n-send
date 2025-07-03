const inputElem = document.querySelector(".input");
const submitElem = document.querySelector(".post-btn");
const chatCanvas = document.querySelector(".post-container");
const onlineCountElem = document.getElementById("online-count");

const ws = new WebSocket(`wss://${location.host}`);
let draftTimestamp = null;
let lastValue = "";

// Start with a new draft ID (timestamp)
function initDraft() {
  draftTimestamp = new Date().toISOString().replace(/:/g, "-");
}
initDraft();

// 🛰 Poll input every 300ms
setInterval(() => {
  const currentValue = inputElem.value;
  if (currentValue !== lastValue && currentValue.trim() !== "") {
    lastValue = currentValue;

    const msg = JSON.stringify({
  messageContent: currentValue,
  time: draftTimestamp,
  isFinal: false
});

    ws.send(msg);
  }
}, 300);

// 🧹 When user clicks "Post", submit final message and clear
submitElem.addEventListener("click", () => {
  const msg = JSON.stringify({
    messageContent: inputElem.value,
    time: draftTimestamp,
    isFinal: true
  });
  ws.send(msg);

  inputElem.value = "";
  lastValue = "";
  initDraft(); // new draft
});

// 📩 Append new messages
function appendMessage(msg) {
  const div = document.createElement("div");
  div.id = "mess";
  div.innerHTML = msg;
  chatCanvas.appendChild(div);
  chatCanvas.scrollTop = chatCanvas.scrollHeight;
}

// 🌐 Handle server responses
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
};
