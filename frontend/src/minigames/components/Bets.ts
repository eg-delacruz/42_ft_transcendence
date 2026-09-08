import { updateManyUserPoints } from './Bets.api';
import { resolveBets } from './Bets.logic';
import type { BetResolveContext, IncomingBet } from './Bets.logic';

type ResolveAndApplyBetsParams = {
  bets: IncomingBet[];
  context: BetResolveContext;
};

export async function resolveAndApplyBets({
  bets,
  context,
}: ResolveAndApplyBetsParams): Promise<void> {
  const updates = resolveBets(bets, context);

  await updateManyUserPoints(
    updates.map((update) => ({
      userId: update.userId,
      nextPoints: update.nextPoints,
    })),
  );
}