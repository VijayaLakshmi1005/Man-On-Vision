/**
 * AAA Spot The Difference Socket Service
 * Handles real-time matchmaking, synchronized game state, and competitive sessions.
 */

const gameSocketService = (io) => {
  const rooms = new Map(); // roomId -> roomState

  io.on('connection', (socket) => {
    console.log(`[STDS] Socket connected: ${socket.id}`);

    // Join a live competition or create a room
    socket.on('stds_join_room', (data) => {
      const { roomId, userId, name, isPrivate } = data;
      socket.join(roomId);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          id: roomId,
          players: [],
          status: 'waiting',
          foundDifferences: {}, // userId -> foundCount
          startTime: null,
          levelId: data.levelId,
          totalDifferences: data.totalDifferences || 5,
          isPrivate: isPrivate || false
        });
      }

      const room = rooms.get(roomId);
      
      // Check if player already in room
      const existingPlayer = room.players.find(p => p.id === userId);
      if (!existingPlayer) {
        room.players.push({
          id: userId,
          socketId: socket.id,
          name: name || 'Anonymous',
          score: 0,
          ready: false
        });
      } else {
        existingPlayer.socketId = socket.id; // Update socket ID on reconnect
      }

      // Notify others in room
      io.to(roomId).emit('stds_room_updated', room);
      console.log(`[STDS] Player ${name} joined room ${roomId}`);
    });

    // Handle difference found (Real-time Sync)
    socket.on('stds_difference_found', (data) => {
      const { roomId, userId, diffIndex } = data;
      const room = rooms.get(roomId);

      if (room && room.status === 'playing') {
        // Track who found what (to prevent double counting)
        if (!room.foundDifferences[diffIndex]) {
          room.foundDifferences[diffIndex] = userId;
          
          const player = room.players.find(p => p.id === userId);
          if (player) {
            player.score += 100;
            
            // Broadcast to everyone that a difference was found
            io.to(roomId).emit('stds_broadcast_find', {
              userId,
              diffIndex,
              playerName: player.name,
              roomScore: room.players.map(p => ({ id: p.id, score: p.score }))
            });

            // Check for Win Condition
            const totalFound = Object.keys(room.foundDifferences).length;
            if (totalFound >= room.totalDifferences) {
              room.status = 'finished';
              const winner = room.players.reduce((prev, current) => (prev.score > current.score) ? prev : current);
              io.to(roomId).emit('stds_game_over', { winner, players: room.players });
              
              // Cleanup room after delay
              setTimeout(() => {
                rooms.delete(roomId);
              }, 60000);
            }
          }
        }
      }
    });

    // Start Game
    socket.on('stds_start_game', (roomId) => {
      const room = rooms.get(roomId);
      if (room) {
        room.status = 'playing';
        room.startTime = Date.now();
        io.to(roomId).emit('stds_game_started', { startTime: room.startTime });
      }
    });

    // Live Reactions
    socket.on('stds_send_reaction', (data) => {
      const { roomId, userId, emoji } = data;
      socket.to(roomId).emit('stds_receive_reaction', { userId, emoji });
    });

    socket.on('disconnect', () => {
      // Find and handle player disconnect from rooms
      rooms.forEach((room, roomId) => {
        const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
        if (playerIndex !== -1) {
          const player = room.players[playerIndex];
          console.log(`[STDS] Player ${player.name} disconnected from ${roomId}`);
          
          // Optionally handle reconnect grace period
          if (room.status === 'waiting') {
            room.players.splice(playerIndex, 1);
            if (room.players.length === 0) {
              rooms.delete(roomId);
            } else {
              io.to(roomId).emit('stds_room_updated', room);
            }
          }
        }
      });
    });
  });
};

module.exports = gameSocketService;
