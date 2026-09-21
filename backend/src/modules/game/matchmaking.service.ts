import { redis } from '../../utils/redis'; // o tu instancia de Redis/memoria

export class MatchmakingService {
  private static QUEUE_KEY = 'matchmaking:queue';

  // Añade un jugador a la cola
  static async addToQueue(userId: string, socketId: string): Promise<{ matched: boolean; opponentId?: string; roomId?: string }> {
    // Comprobar si ya hay alguien esperando en la cola
    const waitingUser = await redis.lpop(this.QUEUE_KEY);

    if (waitingUser) {
      const opponent = JSON.parse(waitingUser);
      
      // Evitar emparejar al usuario consigo mismo si re-envía la solicitud
      if (opponent.userId === userId) {
        await redis.lpush(this.QUEUE_KEY, JSON.stringify(opponent));
        return { matched: false };
      }

      const roomId = `room_${Date.now()}_${userId}_${opponent.userId}`;
      return {
        matched: true,
        opponentId: opponent.userId,
        roomId,
      };
    } else {
      // Si no hay nadie, guardar al jugador actual en la cola
      await redis.rpush(this.QUEUE_KEY, JSON.stringify({ userId, socketId, joinedAt: Date.now() }));
      return { matched: false };
    }
  }

  // Quitar al jugador de la cola si cancela o se desconecta
  static async removeFromQueue(userId: string): Promise<void> {
    const queue = await redis.lrange(this.QUEUE_KEY, 0, -1);
    for (const item of queue) {
      const parsed = JSON.parse(item);
      if (parsed.userId === userId) {
        await redis.lrem(this.QUEUE_KEY, 1, item);
        break;
      }
    }
  }
}