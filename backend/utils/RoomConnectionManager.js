class RoomConnectionManager {
  constructor() {
    this.rooms = new Map();
  }

  joinRoom(roomId, ws) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }
    this.rooms.get(roomId).add(ws);
    
    ws.on('close', () => {
      this.leaveRoom(roomId, ws);
    });
  }

  leaveRoom(roomId, ws) {
    if (this.rooms.has(roomId)) {
      const room = this.rooms.get(roomId);
      room.delete(ws);
      if (room.size === 0) {
        this.rooms.delete(roomId);
      }
    }
  }

  broadcastToRoom(roomId, eventType, payload, senderWs = null) {
    if (this.rooms.has(roomId)) {
      const messageStr = JSON.stringify({ type: eventType, payload });
      for (const client of this.rooms.get(roomId)) {
        if (client !== senderWs && client.readyState === 1) {
          client.send(messageStr);
        }
      }
    }
  }
}

export default RoomConnectionManager;