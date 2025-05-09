import Room from '../models/Room.js';
import {getRandomWord } from '../utils/wordGenerator.js';
import {MAX_PLAYERS, ROUND_TIME } from '../config.js';
import {startTurn} from './gameController.js';


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

    //handling game start from here
      socket.on('startGame',()=> {
      const roomId= socket.data.roomId;
      if(!roomId || !rooms[roomId]) return;
      
      const room =rooms[roomId];
      
      // if our socket is the host of the room
      const player= room.players.find(p=> p.id=== socket.id);
      if(!player || !player.isHost) return;
      
      // starting the game with setting the current round to 1
      room.gameStarted= true;
      room.currentRound= 1;
      
      // startg the first round and first turn, will implement this function further
      startTurn(io,roomId,rooms);
      
      // players in room get notified about the beginning of game
      io.to(roomId).emit('gameStarted',{ currentRound: room.currentRound });
    });

      //handling word selection by drawer, we will take the selected word from frontend and handle accordingly
      socket.on('selectWord',(selectedWord)=>{
      const roomId=socket.data.roomId;
      if(!roomId|| !rooms[roomId]) return;
      
      const room=rooms[roomId];
      
      if(room.currentDrawer=== socket.id) {
        room.currentWord= selectedWord;
        room.guessedPlayers= [];
        
        //let others know the word was selected 
        io.to(roomId).emit('wordSelected',{ 
          length:selectedWord.length,
          drawer:socket.id 
        });
        
        //sending word to the drawer
        socket.emit('wordToDraw',selectedWord);
        
        //starting timer 
        startRoundTimer(io,roomId,rooms);
      }
    });

        //handling drawing by current drawer
      socket.on('draw',(data) => {
      const roomId=socket.data.roomId;
      if(!roomId|| !rooms[roomId]) return;
      
      const room= rooms[roomId];
      const player= room.players.find(p=>p.id=== socket.id);
      
      if(player&& player.isDrawing) {
        socket.to(roomId).emit('drawing',data);
      }
    });

    //messaging feature 
      socket.on('sendMessage',({message})=>{
      const roomId= socket.data.roomId;
      if(!roomId || !rooms[roomId]) return;
      
      const room= rooms[roomId];
      const player= room.players.find(p=> p.id=== socket.id);
      
      if(!player) return;
      
      // checking if the socket is drawer
      if (player.isDrawing) {
        socket.emit('cannotGuess');
        return;
      }
      
      // if player guessed the word
      if(room.guessedPlayers.includes(socket.id)) {
        // if yes send as normal message
        io.to(roomId).emit('newMessage',{
          sender:player.username,
          message,
          isCorrectGuess:false
        });
        return;
      }
      
      // if message is correct word
      if (room.currentWord && message.toLowerCase().trim()=== room.currentWord.toLowerCase()) {
        // guess is correct
        room.guessedPlayers.push(socket.id);
        
        // calculation of score based on speed of guess
        const timeLeft= getRoundTimeLeft(roomId, rooms);
        const score= Math.ceil(timeLeft/ROUND_TIME*500)+ 100;
        
        player.score+= score;
        
        //let others know that a correct guess was made by current player
        io.to(roomId).emit('correctGuess',{
          playerId:socket.id,
          playerName:player.username
        });
        
        //let people know of their scores
        socket.emit('scoreUpdate',{score:player.score});
        
        // update players list with new scores
        io.to(roomId).emit('updatePlayers',room.players);
        
        // Award points to drawer as well
        const drawer= room.players.find(p=>p.id=== room.currentDrawer);
        if(drawer) {
          drawer.score+= 50;
          io.to(roomId).emit('updatePlayers',room.players);
        }
        
        // checking if everyone has guessed the word
        if (room.guessedPlayers.length>= room.players.length-1) {
          endRound(io, roomId, rooms);
        }
      } else {
        // normal message
        io.to(roomId).emit('newMessage',{
          sender:player.username,
          message,
          isCorrectGuess:false
        });
      }
    });
