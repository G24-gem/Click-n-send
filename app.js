const WebSocket = require("ws");
const express = require("express");
const app = express();
const fs = require("fs")
const server = new WebSocket.Server({port: 5555})

if(!fs.existsSync("./chathouse")){
   fs.mkdirSync("./chathouse")
}

server.on("connection", (ws) => {
	ws.on("message", (message) => {
		var msg = message.toString("utf8");
		var content = msg.split(",")[0];
		var filename = msg.split(",")[1];
        
        fs.writeFile(`./chathouse/${filename}`, content, (err) => {
           if(err) console.log(err)
        })
       
       

		console.log(message.toString("utf8"), content) 
	});
     async function send() {
      var con = await fs.readdir("./chathouse", (err, files) => {
          const filesArr = files;
          filesCon = [];
          filesArr.forEach((file) => {
            filesCon.push(fs.readFileSync(`./chathouse/${file}`, "utf8"))
          })
          console.log(filesCon)
       
          function timed() {
          
          	ws.send(filesCon.join("|"))

      }
      timed()
      });
       	
     }
     
     send();
     setInterval(send, 10)


})