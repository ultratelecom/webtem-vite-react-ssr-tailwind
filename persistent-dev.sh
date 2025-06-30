#!/bin/bash
echo "🚀 Starting Persistent Development Server..."

# Kill any existing servers
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2

# Start new server in background
npm run dev -- --host 0.0.0.0 --port 3000 > dev-server.log 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > .dev-server.pid

# Wait for server to start
sleep 5

# Verify server is running
if lsof -ti:3000 > /dev/null; then
  echo "✅ Development Server Started Successfully!"
  echo "📍 Local:   http://localhost:3000"
  echo "📍 Network: http://$(ipconfig getifaddr en0 2>/dev/null || echo "192.168.1.x"):3000"
  echo "📋 PID:     $SERVER_PID"
  echo "📄 Logs:    tail -f dev-server.log"
else
  echo "❌ Server failed to start. Check logs: cat dev-server.log"
  exit 1
fi
