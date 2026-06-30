export type BetOption =
  | 'player1_wins'
  | 'player2_wins'
  | 'gets_top1'
  | 'gets_top2'
  | 'gets_top3'
  | 'loses_top';

export type IncomingBet = {
  id: string;
  bettorUserId: string;
  option: BetOption;
  stakePoints: number;
  rewardPoints: number;
  targetUserId?: string;
};

export type RankingSnapshot = {
  top1?: string;
  top2?: string;
  top3?: string;
};

export type UserPointsMap = Record<string, number>;

export type BetResolveContext = {
  player1UserId?: string;
  player2UserId?: string;
  winnerUserId?: string;
  scoredUserId?: string;
  previousTop: RankingSnapshot;
  nextTop: RankingSnapshot;
  userPoints: UserPointsMap;
};

export type BetPointUpdate = {
  userId: string;
  previousPoints: number;
  nextPoints: number;
  delta: number;
};

function getUserTopPosition(
  ranking: RankingSnapshot,
  userId?: string,
): 1 | 2 | 3 | null {
  if (!userId) return null;
  if (ranking.top1 === userId) return 1;
  if (ranking.top2 === userId) return 2;
  if (ranking.top3 === userId) return 3;
  return null;
}

function isBetWon(bet: IncomingBet, context: BetResolveContext): boolean {
  const targetUserId = bet.targetUserId ?? context.scoredUserId;

  switch (bet.option) {
    case 'player1_wins':
      return context.winnerUserId === context.player1UserId;

    case 'player2_wins':
      return context.winnerUserId === context.player2UserId;

    case 'gets_top1':
      return getUserTopPosition(context.nextTop, targetUserId) === 1;

    case 'gets_top2':
      return getUserTopPosition(context.nextTop, targetUserId) === 2;

    case 'gets_top3':
      return getUserTopPosition(context.nextTop, targetUserId) === 3;

    case 'loses_top': {
      const previousPosition = getUserTopPosition(context.previousTop, targetUserId);
      const nextPosition = getUserTopPosition(context.nextTop, targetUserId);

      return previousPosition !== null && nextPosition === null;
    }

    default:
      return false;
  }
}

export function resolveBets(
  bets: IncomingBet[],
  context: BetResolveContext,
): BetPointUpdate[] {
  const deltasByUser: Record<string, number> = {};

  for (const bet of bets) {
    if (!bet.bettorUserId) continue;
    if (bet.stakePoints <= 0 || bet.rewardPoints <= 0) continue;

    const won = isBetWon(bet, context);
    const delta = won ? bet.rewardPoints : -bet.stakePoints;

    deltasByUser[bet.bettorUserId] =
      (deltasByUser[bet.bettorUserId] ?? 0) + delta;
  }

  return Object.entries(deltasByUser).map(([userId, delta]) => {
    const previousPoints = context.userPoints[userId] ?? 0;
    const nextPoints = Math.max(0, previousPoints + delta);

    return {
      userId,
      previousPoints,
      nextPoints,
      delta,
    };
  });
}