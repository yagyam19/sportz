import { WebSocket, WebSocketServer } from 'ws';
import { wsArcjet } from '../arcjet.js';

function sendJSON(socket, payload) {
  if (socket.readyState !== WebSocket.OPEN) return;

  socket.send(JSON.stringify(payload));
}

function broadcast(wss, payload) {
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  }
}

export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({
    server,
    path: '/ws',
    maxPayload: 1024 * 1024,
  });

  server.on('upgrade', async (req, socket, head) => {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);

    if (pathname !== '/ws') {
      return;
    }

    if (wsArcjet) {
      try {
        const decision = await wsArcjet.protect(req);

        if (decision.isDenied()) {
          const rateLimitProblem = decision.reason.isRateLimit();
          const code = rateLimitProblem ? 1013 : 1008;
          const reason = rateLimitProblem
            ? 'Rate limit exceeded'
            : 'Access Denied';

          socket.close(code, reason);
          return;
        }
      } catch (error) {
        console.log('🚀 ~ attachWebSocketServer ~ error:', error);
        socket.close(1011, 'Server security error');
      }
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  });

  wss.on('connection', async (socket) => {
    socket.isAlive = true;
    socket.on('pong', () => {
      socket.isAlive = true;
    });
    console.log(
      `WebSocket client connected. Total clients: ${wss.clients.size}`,
    );
    sendJSON(socket, { type: 'Welcome' });

    socket.on('error', console.error);

    const heartbeatInterval = setInterval(() => {
      wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
          ws.terminate();
          return;
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    wss.on('close', () => {
      clearInterval(heartbeatInterval);
    });
  });

  function broadcastMatchCreated(match) {
    broadcast(wss, { type: 'match_created', data: match });
  }

  return {
    broadcastMatchCreated,
  };
}
