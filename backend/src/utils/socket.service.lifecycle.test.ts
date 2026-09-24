import assert from 'node:assert/strict';
import { SocketService } from './socket.service';

class FakeRedis {
  public data = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.data.get(key) ?? null;
  }

  async set(key: string, value: string): Promise<'OK'> {
    this.data.set(key, value);
    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    let removed = 0;
    for (const key of keys) {
      if (this.data.delete(key)) removed += 1;
    }
    return removed;
  }

  async exists(key: string): Promise<number> {
    return this.data.has(key) ? 1 : 0;
  }

  async mget(...keys: string[]): Promise<Array<string | null>> {
    return keys.map((key) => this.data.get(key) ?? null);
  }

  async smembers(): Promise<string[]> {
    return [];
  }

  async sadd(): Promise<number> {
    return 1;
  }

  async srem(): Promise<number> {
    return 1;
  }

  async lrange(): Promise<string[]> {
    return [];
  }

  async lrem(): Promise<number> {
    return 0;
  }

  async rpush(): Promise<number> {
    return 1;
  }
}

(async () => {
  const io = {
    to: () => ({ emit: () => undefined }),
  } as any;

  const redis = new FakeRedis();
  redis.data.set(
    'matchmaking:active',
    JSON.stringify({
      roomId: 'global',
      game: 'the_race',
      players: [
        { userId: 'u1', role: 'player1' },
        { userId: 'u2', role: 'player2' },
      ],
      spectators: [],
    }),
  );
  redis.data.set('user_presence:u1', JSON.stringify({ userId: 'u1' }));
  redis.data.set('matchmaking:game-state', JSON.stringify({ game: 'the_race' }));

  const service = new SocketService(io, redis as any);
  await service.handlePlayerDeparture('u2');

  assert.equal(redis.data.has('matchmaking:active'), false, 'active match should be cleared');
  assert.equal(redis.data.has('matchmaking:game-state'), false, 'game state should be cleared');
  console.log('socket.service lifecycle check: ok');
})();
