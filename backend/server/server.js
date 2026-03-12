const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { RateLimiterMemory } = require("rate-limiter-flexible");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const users = new Map(); 
const waitingPool = new Set(); 

// Anti-spam: Max 5 messages per second
const msgRateLimiter = new RateLimiterMemory({
  points: 5, 
  duration: 1, 
});

function updateStats() {
  io.emit("stats", { online: users.size, waiting: waitingPool.size });
}

function findMatch(socketId) {
  const user = users.get(socketId);
  if (!user) return;

  const userInterests = user.interests || [];

  for (const candidateId of waitingPool) {
    if (candidateId === socketId || candidateId === user.lastPartnerId) continue;

    const candidate = users.get(candidateId);
    if (!candidate) continue;

    // Matching Logic: Intersection of interest arrays
    const common = userInterests.filter(i => candidate.interests?.includes(i));
    
    // Match if: Both have no interests OR they share at least one
    if (userInterests.length === 0 || common.length > 0) {
      waitingPool.delete(socketId);
      waitingPool.delete(candidateId);

      user.partnerId = candidateId;
      candidate.partnerId = socketId;

      const matchMsg = common.length > 0 
        ? `Matched! You both like: ${common.join(", ")}` 
        : "Connected to a stranger!";

      user.socket.emit("status", { type: "connected", msg: matchMsg });
      candidate.socket.emit("status", { type: "connected", msg: matchMsg });
      return;
    }
  }

  waitingPool.add(socketId);
  user.socket.emit("status", { type: "waiting", msg: "Looking for someone with your interests..." });
}

io.on("connection", (socket) => {
  users.set(socket.id, { socket, partnerId: null, lastPartnerId: null, interests: [] });
  updateStats();

  socket.on("set-interests", (interests) => {
    const user = users.get(socket.id);
    if (user) {
      user.interests = interests.map(i => i.toLowerCase().trim()).filter(i => i !== "");
      findMatch(socket.id);
    }
  });

  socket.on("chat", async (msg) => {
    const user = users.get(socket.id);
    if (!user?.partnerId) return;
    try {
      await msgRateLimiter.consume(socket.id);
      users.get(user.partnerId)?.socket.emit("chat", msg);
    } catch {
      socket.emit("status", { type: "error", msg: "Too many messages! Slow down." });
    }
  });

  socket.on("typing", () => {
    const user = users.get(socket.id);
    if (user?.partnerId) {
      users.get(user.partnerId)?.socket.emit("typing");
    }
  });

  socket.on("next", () => {
    const user = users.get(socket.id);
    if (!user) return;
    if (user.partnerId) {
      const partner = users.get(user.partnerId);
      if (partner) {
        partner.lastPartnerId = socket.id;
        partner.partnerId = null;
        partner.socket.emit("status", { type: "disconnected", msg: "Stranger skipped the chat." });
        findMatch(partner.socket.id);
      }
    }
    user.lastPartnerId = user.partnerId;
    user.partnerId = null;
    findMatch(socket.id);
  });

  socket.on("disconnect", () => {
    const user = users.get(socket.id);
    if (user?.partnerId) {
      const partner = users.get(user.partnerId);
      if (partner) {
        partner.partnerId = null;
        partner.socket.emit("status", { type: "disconnected", msg: "Stranger disconnected." });
        findMatch(partner.socket.id);
      }
    }
    users.delete(socket.id);
    waitingPool.delete(socket.id);
    updateStats();
  });
});

server.listen(3000, () => console.log("🚀 Server running on port 3000"));