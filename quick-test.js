const http = require('http');

// Test if we can create a simple server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    status: 'OK', 
    message: 'SLD App Backend is working!',
    timestamp: new Date().toISOString()
  }));
});

const PORT = 3002;

server.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
  console.log(`📊 Test it: curl http://localhost:${PORT}`);
  console.log(`🛑 Press Ctrl+C to stop`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`❌ Port ${PORT} is already in use`);
    console.log(`💡 Try: npx kill-port ${PORT}`);
  } else {
    console.error('Server error:', err);
  }
});