class Room {
    constructor() {
      this.players= [];
      this.currentDrawer= null;
      this.currentWord= null;
      this.currentRound= 0;
      this.totalRounds= 3;
      this.guessedPlayers= [];
      this.timer= null;
      this.wordOptions= [];
      this.gameStarted= false;
    }
  }
export default Room;
