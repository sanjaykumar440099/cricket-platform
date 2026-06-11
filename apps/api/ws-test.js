const { io } = require('socket.io-client');

const [, , matchId, lastEventId] = process.argv;
const socketUrl = process.env.SOCKET_URL || 'http://localhost:3000';

if (!matchId) {
  console.error('Usage: node ws-test.js <matchId> [lastEventId]');
  process.exit(1);
}

const query = {
  matchId,
  ...(lastEventId ? { lastEventId } : {}),
};

const socket = io(socketUrl, {
  transports: ['websocket', 'polling'],
  query,
  reconnection: true,
});

socket.on('connect', () => {
  console.log(`Connected to ${socketUrl} as ${socket.id}`);
  socket.emit('joinMatch', query);
});

socket.on('connectionReady', payload => {
  console.log('Connection ready:', payload);
});

socket.on('resumeState', payload => {
  console.log('Resume state:', JSON.stringify(payload, null, 2));
});

socket.on('resume', payload => {
  console.log('Resume envelope:', JSON.stringify(payload, null, 2));
});

socket.on('scoreUpdate', payload => {
  console.log('Live score update:', JSON.stringify(payload, null, 2));
});

socket.on('spectatorCount', payload => {
  console.log('Spectator count:', payload);
});

socket.on('joinMatchError', payload => {
  console.error('Join match error:', payload);
});

socket.on('connect_error', error => {
  console.error('Connection error:', error.message);
});
