import { PlayerWithStats } from '@/types/sorare';

export function calculateSorareValue(player: PlayerWithStats): number {
  if (!player.stats || !player.cards.nodes.length) return 0;

  // Get card price
  const price = parseFloat(player.cards.nodes[0]?.latestEnglishAuction?.currentPrice || '0');
  if (!price) return 0;

  const stats = player.stats;
  const games = stats.gamesPlayed || 1;

  // Calculate performance
  const goalsPerGame = stats.goals / games;
  const assistsPerGame = stats.assists / games;
  const minutesPerGame = stats.minutesPlayed / games;

  const performance =
    (goalsPerGame * 15) +
    (assistsPerGame * 10) +
    (minutesPerGame / 90 * 5);

  // Age factor
  const ageFactor =
    player.age < 23 ? 1.4 :
    player.age < 26 ? 1.2 :
    player.age < 29 ? 1.0 : 0.7;

  // Calculate value
  const priceNorm = price / 100;
  const value = (performance * ageFactor) / Math.max(priceNorm, 0.1);

  // Scale to 0-10
  return Math.min(Math.max(value, 0), 10);
}
