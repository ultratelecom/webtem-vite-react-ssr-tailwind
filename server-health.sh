#!/bin/bash
check_server() {
  if lsof -ti:3000 > /dev/null; then
    echo "✅ Server Status: RUNNING on port 3000"
    echo "📊 Response Test: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "Connection Failed")"
    return 0
  else
    echo "❌ Server Status: NOT RUNNING"
    return 1
  fi
}

restart_server() {
  echo "🔄 Restarting Development Server..."
  ./persistent-dev.sh
}

# Run health check
if ! check_server; then
  echo "🚨 Server down! Auto-restarting..."
  restart_server
fi
