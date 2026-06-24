import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ft_transcendence API',
      version: '1.0.0',
      description:
        'Interactive API documentation for the ft_transcendence backend. Protected endpoints require the access_token cookie set via /auth/login or /auth/register.',
    },
    servers: [{ url: '/api' }],
    tags: [
      {
        name: 'Chat (WebSocket)',
        description: 'Real-time chat over Socket.IO. Not REST — see the /chat endpoint below for connection details and event reference.',
      },
    ],
    paths: {
      '/chat': {
        get: {
          tags: ['Chat (WebSocket)'],
          summary: 'WebSocket connection info & event reference',
          description:
            '**This is not a REST endpoint.** It documents the Socket.IO WebSocket API.\n\n' +
            '## Connection\n\n' +
            'Connect to `ws://localhost:3000/chat` using the Socket.IO client:\n\n' +
            '```js\n' +
            'const socket = io("http://localhost:3000/chat", {\n' +
            '  withCredentials: true,\n' +
            '  transports: ["websocket"],\n' +
            '});\n' +
            '```\n\n' +
            'Auth is automatic — the `access_token` cookie is sent with the handshake.\n\n' +
            '## Client → Server events\n\n' +
            '| Event | Payload | Ack Response |\n' +
            '|-------|---------|--------------|\n' +
            '| `get_rooms` | `{}` | `{ rooms: RoomInfo[] }` |\n' +
            '| `create_room` | `{ name, description? }` | `{ room }` |\n' +
            '| `get_room` | `{ roomId }` | `RoomInfo` |\n' +
            '| `get_room_messages` | `{ roomId, limit?, offset? }` | `{ messages, total }` |\n' +
            '| `join_room` | `{ roomId }` | `{ roomId, userId }` |\n' +
            '| `leave_room` | `{ roomId }` | `{ roomId, userId }` |\n' +
            '| `send_message` | `{ roomId, text }` | `ChatMessage` (max 5000 chars) |\n' +
            '| `typing` | `roomId` (string) | No ACK |\n' +
            '| `stop_typing` | `roomId` (string) | No ACK |\n\n' +
            '## Server → Client events\n\n' +
            '| Event | Payload |\n' +
            '|-------|---------|\n' +
            '| `message:new` | `ChatMessage` |\n' +
            '| `room:user_joined` | `{ roomId, user, timestamp }` |\n' +
            '| `room:user_left` | `{ roomId, user, timestamp }` |\n' +
            '| `room:typing` | `{ roomId, user, timestamp }` |\n' +
            '| `room:stop_typing` | `{ roomId, user, timestamp }` |\n\n' +
            'Redis-backed pub/sub adapter. Message history capped at 200 per room. If Redis is down, the chat namespace is not initialized (graceful degradation).',
          responses: {
            '101': {
              description: 'Switching Protocols — WebSocket upgrade. This is informational; the actual communication happens via Socket.IO events listed above.',
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'access_token',
        },
      },
    },
  },
  apis: [path.join(__dirname, '..', 'modules', '**', '*.routes.{ts,js}')],
};

export const swaggerSpec = swaggerJsdoc(options);
