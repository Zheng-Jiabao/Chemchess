// const express = require('express');
// const app = express();
// const path = require('path');
// const server = require('http').createServer(app);
// const io = require('socket.io')(server);
// const port = process.env.PORT || 1050;


// function runserver(){

// server.listen(port, () => {
//   console.log('Server listening at port %d', port);
// });

// // Routing
// app.use(express.static(path.join(__dirname, 'public')));

// // Chatroom

// let numUsers = 0;

// io.on('connection', (socket) => {
//   let addedUser = false;

//   // when the client emits 'new message', this listens and executes
//   socket.on('new message', (data) => {
//     // we tell the client to execute 'new message'
//     socket.broadcast.emit('new message', {
//       username: socket.username,
//       message: data
//     });
//   });

//   // when the client emits 'add user', this listens and executes
//   socket.on('add user', (username) => {
//     if (addedUser) return;

//     // we store the username in the socket session for this client
//     socket.username = username;
//     ++numUsers;
//     addedUser = true;
//     socket.emit('login', {
//       numUsers: numUsers
//     });
//     // echo globally (all clients) that a person has connected
//     socket.broadcast.emit('user joined', {
//       username: socket.username,
//       numUsers: numUsers
//     });
//   });

//   // when the client emits 'typing', we broadcast it to others
//   socket.on('typing', () => {
//     socket.broadcast.emit('typing', {
//       username: socket.username
//     });
//   });

//   // when the client emits 'stop typing', we broadcast it to others
//   socket.on('stop typing', () => {
//     socket.broadcast.emit('stop typing', {
//       username: socket.username
//     });
//   });

//   // when the user disconnects.. perform this
//   socket.on('disconnect', () => {
//     if (addedUser) {
//       --numUsers;

//       // echo globally that this client has left
//       socket.broadcast.emit('user left', {
//         username: socket.username,
//         numUsers: numUsers
//       });
//     }
//   });
// });

// }
// module.exports=()=>{runserver()}

function runserver(){
  console.log("Hello");
// 导入WebSocket模块:
const WebSocket = require('ws');

// 引用Server类:
const WebSocketServer = WebSocket.Server;

// 实例化:
const wss = new WebSocketServer({
    port: 1050
});

/*
** randomWord 产生任意长度随机字母数字组合
** randomFlag-是否任意长度 min-任意长度最小位[固定位数] max-任意长度最大位
** xuanfeng 2014-08-28
*/
 
function randomWord(randomFlag, min, max){
  var str = "",
      range = min,
      arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  // 随机产生
  if(randomFlag){
      range = Math.round(Math.random() * (max-min)) + min;
  }
  for(var i=0; i<range; i++){
      pos = Math.round(Math.random() * (arr.length-1));
      str += arr[pos];
  }
  return str;
}

var userlist={}

var CONFIG={field:"",players:[]}

function send_to_all(mes){
  console.log(`[SERVER] Sent: ${mes}`);
  for (const key in userlist) {
    if (Object.hasOwnProperty.call(userlist, key)) {
     userlist[key].send(mes);
    }
  }
  controller.send(mes)
}

var controller={}
controller.send=()=>{}

wss.on('connection', function (ws) {
  console.log(`[SERVER] connection()`);
  ws.on('message', function (message) {
      console.log(`[SERVER] Received: ${message}`);
      message=message.split("|")
      switch(message[0]){
        case "CONNECTED_USER":{
          if(!userlist[message[1]]){            
            CONFIG.players.push({name:message[2],id:message[1]})
          }
          userlist[message[1]]=ws
          console.log(`[SERVER] Send:CURRENT_CONFIG|${JSON.stringify(CONFIG)}`);
          send_to_all("CURRENT_CONFIG|"+JSON.stringify(CONFIG))
          break;
        }
        case "ENTER_GAME":{
          CONFIG.field=randomWord(false,32)
          send_to_all("ENTER_GAME|"+CONFIG.field)
          break;
        }
        case "DISCONNETED_USER":{
          delete userlist[message[1]]
          CONFIG.players.splice(CONFIG.players.findIndex((item, index) => {return item.id==message[1];}),1)
          send_to_all("CURRENT_CONFIG|"+JSON.stringify(CONFIG))
          controller.send
          break;
        }
        case "G":{
          send_to_all(message.join("|"))
          break;
        }
        case "I_AM_THE_CONTROLLER":{
          controller=ws;
          controller.send("yes,you are.qwq")
          break;
        }
        case "END_THE_CONFIG":{
          send_to_all("CONFIG_ENDED")
          controller.send("CONFIG_ENDED")
          userlist={}
          CONFIG={field:"",players:[]}
        }
      }
    

  })
});
}

runserver()