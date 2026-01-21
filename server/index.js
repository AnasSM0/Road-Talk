const { Server } = require("socket.io");
const http = require("http");

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 3000;

// Map: PlateID -> SocketID
const clients = new Map();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // 1. Join with Plate ID
  socket.on("join", ({ plate }) => {
    if (!plate) return;
    console.log(`Socket ${socket.id} registered as ${plate}`);
    clients.set(plate, socket.id);
    socket.join(plate); // Join a room with their Plate ID for direct messaging
    
    // Notify others? Not strictly necessary if we rely on radar
  });

  // 2. Location Updates (Module A)
  // Payload: { plate, lat, lng, type, bearing, speed }
  socket.on("update_location", (data) => {
    // Broadcast to everyone else so they can see this user on radar
    socket.broadcast.emit("location_update", data);
  });

  // 3. Signaling (Module C - WebRTC)
  // Payload: { type, sdp, candidate, from, to, ... }
  socket.on("signal", (payload) => {
    const { target } = payload; // Target Plate ID
    if (clients.has(target)) {
      console.log(`Relaying ${payload.type} from ${payload.from} to ${target}`);
      io.to(target).emit("signal", payload);
    } else {
      console.log(`Target ${target} not found for signal`);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    // Remove from clients map
    for (const [plate, sid] of clients.entries()) {
      if (sid === socket.id) {
        clients.delete(plate);
        break;
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Signaling Server running on port ${PORT}`);
});
