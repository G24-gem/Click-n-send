const inputElem = document.querySelector(".input");
const submitElem = document.querySelector(".post-btn");
const chatCanvas = document.querySelector(".post-container");

const ws = new WebSocket(`wss://${location.host}`); // Deployment
// const ws = new WebSocket("ws://localhost:7700"); // Testing

let timestamp = new Date().toISOString().replace(/:/g, "-");
let lastValue = "";
let msgArr = [];

// Message Deletion Helper
function delFun(Arr, index) {
  for (let i = index; i < Arr.length - 1; i++) {
    Arr[i] = Arr[i + 1];
  }
  if (Arr.length > 0) Arr.length--;
  return Arr;
}

// Incoming message handler
ws.onmessage = (message) => {
  chatCanvas.innerHTML = "";
  const msgArrLocal = message.data.split("|");
  msgArrLocal.forEach((item) => {
    const div = document.createElement("div");
    div.id = "mess";
    div.innerHTML = item;
    chatCanvas.appendChild(div);
  });
  chatCanvas.scrollTop = chatCanvas.scrollHeight;
};

// Poll input value every 300ms
setInterval(() => {
  const currentValue = inputElem.value;
  if (currentValue !== lastValue) {
    lastValue = currentValue;
    msgArr = currentValue.split("");

    const msg = JSON.stringify({ messageContent: currentValue, time: timestamp });
    ws.send(msg);

    // Optional visual trigger: simulate click if needed
    submitElem.click(); // only if you want to simulate activity
  }
}, 300);

// Click event (clears input + resets timestamp)
submitElem.addEventListener("click", () => {
  timestamp = new Date().toISOString().replace(/:/g, "-");
});
