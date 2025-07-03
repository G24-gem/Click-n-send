const inputElem = document.querySelector(".input");
const submitElem = document.querySelector(".post-btn");
const chatCanvas = document.querySelector(".post-container");
const onlineCountElem = document.getElementById("online-count");

const ws = new WebSocket(`wss://${location.host}`);/*Deployment*/
//const ws = new WebSocket("ws://localhost:7700");/*Testing*/

let timestamp = new Date().toISOString().replace(/:/g, "-");
let msgArr = [];

function delFun(Arr, index) {
    for (let i = index; i < Arr.length - 1; i++) {
        Arr[i] = Arr[i + 1];
    }
    if (Arr.length > 0) Arr.length--;
    return Arr;
}

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

inputElem.addEventListener("input", (e) => {
    const value = e.target.value;
    msgArr = value.split("");
    console.log(msgArr)
    const msg = JSON.stringify({ messageContent: value, time: timestamp });
    ws.send(msg);
});

inputElem.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (key === "backspace") {
        msgArr = delFun(msgArr, msgArr.length);
        const msg = JSON.stringify({ messageContent: msgArr.join(""), time: timestamp });
        ws.send(msg);
    }
});

submitElem.addEventListener("click", () => {
    inputElem.value = "";
    timestamp = new Date().toISOString().replace(/:/g, "-");
});
