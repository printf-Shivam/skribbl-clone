import {getRandomWord} from '../utils/wordGenerator.js';
import {ROUND_TIME} from '../config.js';

export function startTurn(io,roomId,rooms){
  const room= rooms[roomId];
  if(!room) return;
  
  // clearing the data from the previious turn
  clearInterval(room.timer);
  room.guessedPlayers = [];
  
  // finding the next drawer for next turn
  const currentIndex= room.players.findIndex(p =>p.id ===room.currentDrawer);
  const nextIndex= currentIndex ===-1? 0: (currentIndex + 1) % room.players.length;
  
  //setting drawing status of every player in room
  room.players.forEach(p=> p.isDrawing= false);
  
  //setting the next drawer for room
  room.currentDrawer= room.players[nextIndex].id;
  room.players[nextIndex].isDrawing= true;
  
  //word option for current drawer
  room.wordOptions = [
    getRandomWord(),
    getRandomWord(),
    getRandomWord()
  ];
  
  //sending the options to drawer
  io.to(room.currentDrawer).emit('chooseWord', room.wordOptions);
  
  //let others know about the new drawer 
  io.to(roomId).emit('newDrawer',{ 
    drawerId:room.currentDrawer,
    username:room.players[nextIndex].username
  });
  
  //update oother players with new drawing status
  io.to(roomId).emit('updatePlayers',room.players);
}
export function startRoundTimer(io, roomId, rooms){
  const room = rooms[roomId];
  if(!room) return ;
  let timeLeft=ROUND_TIME;

  //clear existing timer
  clearInterval(room.timer);

  //set timer for the room
  room.timer =setInterval(()=>{
    timeLeft--;
  
  //updating time and sending to all players
  io.to(roomId).emit('timeUpdate',{timeLeft});

  //ending round if the time is up
  if(timeLeft <=0){
  endRound(io,roomId,rooms); //we will implement this function later 
  }
  },1000);
}
