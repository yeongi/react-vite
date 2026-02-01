const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for simplicity in this setup
    methods: ["GET", "POST"]
  }
});

let waitingPlayer = null;

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  if (waitingPlayer) {
    // Pair with waiting player
    const room = `room_${waitingPlayer.id}_${socket.id}`;
    socket.join(room);
    waitingPlayer.join(room);

    io.to(room).emit('start_game', { room });
    
    // Notify players of their opponent's ID if needed, or just that game started
    console.log(`Game started in ${room}`);
    waitingPlayer = null;
  } else {
    // No one waiting, this player waits
    waitingPlayer = socket;
    socket.emit('waiting_for_opponent');
    console.log(`User ${socket.id} is waiting`);
  }

  socket.on('update_state', (data) => {
    // Broadcast to everyone else in the room (should be just the one opponent)
    // socket.to(room) is safer but we need to track the room. 
    // For now, simpler: broadcast to all rooms the socket is in (except their own ID room)
    socket.rooms.forEach(room => {
      if (room !== socket.id) {
        socket.to(room).emit('opponent_state', data);
      }
    });
  });

  socket.on('player_won', () => {
     socket.rooms.forEach(room => {
      if (room !== socket.id) {
        // Tell the other person they lost
        socket.to(room).emit('game_over_lose');
        // Tell this person they won (confirmation)
        socket.emit('game_over_win');
      }
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (waitingPlayer === socket) {
      waitingPlayer = null;
    }
    // Handle disconnect during game (win by default for other?)
    // For now, simple disconnect logic
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
