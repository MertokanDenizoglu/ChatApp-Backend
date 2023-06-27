const express = require("express");
const app = express();
const dotenv = require("dotenv");
const port = 5000;
const mongoose = require("mongoose");
const cors = require("cors");
const logger = require("morgan");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

//ROUTES START
const registerRoute = require("./routes/auth.js");
//ROUTES END

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected MongoDB");
  } catch (error) {
    throw error;
  }
};

//middleware
app.use(cors());
app.use(express.json());
app.use(logger("dev"));
//middleware end

//ROUTES
app.use("/api/auth", registerRoute);
//ROUTES END

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A new user connected: " + socket.id);
  socket.on("room",(data)=>{
      socket.join(data)
  })
  socket.on("message",(data)=>{
     socket.to(data.room).emit('messageReturn' , data)
  })

});

server.listen(port, () => {
  connect();
  console.log(`Server http://localhost:${port} adresinde çalışıyor`);
});
