
const inputElem = document.querySelector(".input");
const submitElem = document.querySelector(".post-btn");
const chatCanvas = document.querySelector(".post-container");
const ws = new WebSocket(`wss://${location.host}`);

var timestamp = new Date().toISOString().replace(/:/g, "-");
var msgArr = [];

function delFun(Arr, index) {
        const ind = index;
        var Arr = Arr;

        for (var i = index; i < Arr.length-1; i++) {
                Arr[i] = Arr[i+1];
        }
        if (!(Arr.length == 0)) {Arr.length--};
        return Arr;
}




//listens for server's message
ws.onmessage = (message) => {
        chatCanvas.innerHTML = "";
        var msgArrLocal  = message.data.split("|");
         msgArrLocal.forEach( (item) => {
                var div = document.createElement("div");
        div.id = "mess";
        div.innerHTML = item;
        chatCanvas.appendChild(div);
      })
}
 chatCanvas.scrollTop = chatCanvas.scrollHeight;

//sends the receive message
function sendMessageEvent() {
        inputElem.addEventListener("keydown", (e) => {
             var msg = "";
             var key = e.key;
                     if(key.length === 1) {
            
 msgArr.push(e.key);
                              msg = [`${msgArr.join().replace(/,/g, "")}`, timestamp];
                              ws.send(msg);  

                   }
             


          var specialKeys = "backspace" || "enter";
          var keyLower = e.key.toLowerCase();


            if (keyLower == specialKeys) {
                    if (specialKeys == "backspace") { 
                             msgArr = delFun(msgArr, msgArr.length)
                 var msg1 = [`${msgArr.join().replace(/,/g, "")}`, timestamp];
                             console.log(msgArr)
                     ws.send(msg1)
                    }
            }

        })
}

sendMessageEvent()
submitElem.addEventListener("click", () => {
   inputElem.value = "";
   timestamp = new Date().toISOString().replace(/:/g, "-");
}) 