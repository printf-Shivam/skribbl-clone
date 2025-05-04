import Room from '../models/Room.js';
import {getRandomWord } from '../utils/wordGenerator.js';
import {MAX_PLAYERS, ROUND_TIME } from '../config.js';

// game state
const rooms = {};

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    // handling the players who are joining
    socket.on('joinRoom', ({roomId,username}) => {
      if (!rooms[roomId]) {
        rooms[roomId]=new Room();
      }
      const room=rooms[roomId];
      
      // check if room is full
      if (room.players.length>= MAX_PLAYERS) {
        socket.emit('roomFull');
        return;
      }
      // adding player to the room 
      const player= {
        id:socket.id,
        username,
        score: 0,
        isDrawing: false
      };
      
      room.players.push(player);
      socket.join(roomId);
      
      //if joined player is first player in room, he/she is the host of the room
      const isHost=room.players.length ===1;
      if(isHost){
        player.isHost =true;
      }
      
      //if a new player joined, let others know
      socket.to(roomId).emit('playerJoined',player);
      
      // send room data to the new player
      socket.emit('roomJoined', {
        roomId,
        players: room.players,
        isHost,
        gameStarted:room.gameStarted
      });
      
      // keep updating players list after each join and leave
      io.to(roomId).emit('updatePlayers', room.players);
      
      socket.data.roomId = roomId;
    });
