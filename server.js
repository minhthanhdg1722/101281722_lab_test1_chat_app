const app = require('express')()
const http = require('http').createServer(app)
const cors = require('cors')
const { SocketAddress } = require('net')
const PORT = 3003
const io = require('socket.io')(http)
const mongoose = require('mongoose');
const messageModel = require('../lab_test1/models/Message.js')

app.use(cors())

app.get("/", (req,res) => {
    res.sendFile(__dirname + '/client/index.html')
})


  app.post('/messages', (req, res) => {
    var message = new messageModel(req.body);
    message.save((err) =>{ 
      if(err)
      {
        //sendStatus(500);
        console.log(err)
      }
  
      //Send Message to all users
      io.emit('message', req.body);
      res.sendStatus(200);
    })
  })

var users = []


mongoose.connect('mongodb+srv://mthanhdg:Mt6475139798@cluster0.muxfz.mongodb.net/labTest1?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(success => {
  console.log('Success Mongodb connection')
}).catch(err => {
  console.log('Error Mongodb connection')
});

io.on('connection', (socket) => {
    
    var room
    var typing = false
    var timeout = undefined
    
    socket.on('newUser', (name) => { 
        if(users.indexOf(name) < 0) {
           users.push(name);
           user = name
           socket.emit('userSet', {username: name});
        } else {
            socket.emit('userExists', name + ' username is taken! Try some other username.');
        }
     });

    
    socket.on('joinroom', (roomName) =>{
        socket.join(roomName)
        room = roomName
        socket.emit("roomSet", {room: roomName})
    })

    socket.on('leaveroom', (roomName) =>{
        socket.leave(roomName)
        room = ''
        socket.emit("roomDel", {room: roomName})
    })
    
    socket.on('msg', function(data) {
        io.in(room).emit('newmsg', data)
     })

    socket.on("disconnect", ()=>[
        console.log(`${socket.id} disconnected`)
    ])
})



http.listen(PORT, ()=>{
    console.log(`Server started at ${PORT}`)
})