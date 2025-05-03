import dotenv from "dotenv";
dotenv.config()
import express, { json } from 'express';
import {createServer} from 'http';
import {Server} from 'socket.io';
import cors from 'cors';
import {setupSocketHandlers from './socket/SocketHandler.js';

const app=express();
app.use(cors());
app.use(json());

const server=createServer(app);

const io=new Server(server,{
  cors:{
    origin:'*',
    methods:["GET","POST"]
  }
})

setupSocketHandlers(io);

const PORT=process.env.PORT || 5000;
server.listen(PORT,()=>{
  console.log(`Server running on port ${PORT}`);
});
