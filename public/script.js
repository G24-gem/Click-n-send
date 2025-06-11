const inputElem = document.querySelector(".input");
const submitElem = document.querySelector(".post-btn");
const chatCanvas = document.querySelector(".post-container");
const ws = new WebSocket(`wss://${location.host}`);

let timestamp = new Date().toISOString().replace(/:/g, "-");
let msgArr = [];

function delFun(arr, index) {
    for (let i = index; i < arr.length - 1; i++) {
        arr[i] = arr[i + 1];
    }
    if (arr.length > 0) arr.length--;
    return arr;
}

// WebSocket message listener
ws.onmessage = (message) => {
    chatCanvas.innerHTML = "";
    const msgArrLocal = message.data.split("|");
    msgArrLocal.forEach((item) => {
        const div = document.createElement("div");
        div.id = "mess";
        div.innerHTML = item;
        chatCanvas.appendChild(div);
    });

    // scroll to bottom on new message
    chatCanvas.scrollTop = chatCanvas.scrollHeight;
};

// Keydown event listener
inputElem.addEventListener("keydown", (e) => {
    const key = e.key;

    if (key.length === 1) {
        // Standard character
        msgArr.push(key);
        const msg = [`${msgArr.join("")}`, timestamp];
        ws.send(msg.join("|"));
        alert("it was triggered");
    } else if (key.toLowerCase() === "backspace") {
        // Backspace handling
        msgArr = delFun(msgArr, msgArr.length - 1);
        const msg = [`${msgArr.join("")}`, timestamp];
        ws.send(msg.join("|"));
    } else if (key.toLowerCase() === "enter") {
        // Reset input field and message array
        inputElem.value = "";
        msgArr = [];
        timestamp = new Date().toISOString().replace(/:/g, "-");
    }
});
