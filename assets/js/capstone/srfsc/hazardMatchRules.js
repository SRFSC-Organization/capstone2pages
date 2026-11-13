// ============================================
// hazardMatchRules.js
// RESPONSIBILITY: Yard Walk game state and scoring. No DOM access,
// so the rules can be tested in Node and reused by any front end.
// ============================================

/**
 * Start a new game.
 * @param {{ roundIds: string[], startingScore: number, penalty: number }} config
 */
export function createGame({ roundIds, startingScore, penalty }) {
  if (!Array.isArray(roundIds) || roundIds.length === 0) {
    throw new Error('Yard Walk needs at least one round id.');
  }
  if (new Set(roundIds).size !== roundIds.length) {
    throw new Error(`Yard Walk round ids must be unique: ${roundIds.join(', ')}`);
  }
  if (!Number.isFinite(startingScore) || !Number.isFinite(penalty)) {
    throw new Error('Yard Walk startingScore and penalty must be numbers.');
  }
  return Object.freeze({
    roundIds: Object.freeze([...roundIds]),
    startingScore,
    penalty,
    matched: Object.freeze([]),
    mistakes: 0,
  });
}

/**
 * Try to place a hazard on a fix. Returns the next state and whether it matched.
 * A hazard is only correct on the fix with the same round id.
 */
export function tryMatch(game, hazardId, fixId) {
  for (const id of [hazardId, fixId]) {
    if (!game.roundIds.includes(id)) throw new Error(`Unknown Yard Walk round: ${id}`);
  }
  if (game.matched.includes(hazardId) || game.matched.includes(fixId)) {
    return { correct: false, ignored: true, game };
  }
  if (hazardId === fixId) {
    return { correct: true, ignored: false, game: Object.freeze({ ...game, matched: Object.freeze([...game.matched, hazardId]) }) };
  }
  return { correct: false, ignored: false, game: Object.freeze({ ...game, mistakes: game.mistakes + 1 }) };
}

export function currentScore(game) {
  return Math.max(0, game.startingScore - game.mistakes * game.penalty);
}

export function isComplete(game) {
  return game.matched.length === game.roundIds.length;
}

/**
 * Pick the first rating whose min is at or below the score.
 * @param {number} score
 * @param {{ min: number }[]} ratings ordered highest min first
 */
export function rateScore(score, ratings) {
  const rating = ratings.find((candidate) => score >= candidate.min);
  if (!rating) throw new Error(`No Yard Walk rating covers a score of ${score}.`);
  return rating;
}
