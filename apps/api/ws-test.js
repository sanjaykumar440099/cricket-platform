const { io } = require("socket.io-client");

const socket = io('http://localhost:3000', {
  auth: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsInJvbGUiOiJzY29yZXIiLCJpYXQiOjE3NjgyMjQ2OTAsImV4cCI6MTc2ODgyOTQ5MH0.StMbIn8wt809qO_6pyxUZxwomMDvIE1XvdvIQEIPOUw',
  },
});

socket.on("connect", () => {
  console.log("✅ Connected to WebSocket server");
  socket.emit("joinMatch", "inning-1");
});

socket.on("scoreUpdate", (data) => {
  console.log("🏏 LIVE SCORE UPDATE:", data);
});
