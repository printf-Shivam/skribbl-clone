const express =require('express')
const http =require('http')
const socketio= require('socket.io')
const cors =require('cors')
const dotenv=require('dotenv')
const connectDB=require('./config/db');

dotenv.config()

connectDB();
const app= express()
const server= http.createServer(app);
const io =socketio(server, {
  cors: {
    origin:'http://localhost:3000',
    methods:['GET','POST']
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/users',require('./routes/users'));
app.use('/api/rooms',require('./routes/rooms'));
app.use('/api/auth',require('./routes/auth'));

const { handleSocketConnection }=require('./utils/socket');
io.on('connection',handleSocketConnection);

const PORT=process.env.PORT || 5000;

server.listen(PORT, ()=> console.log(`Server running on port ${PORT}`));
