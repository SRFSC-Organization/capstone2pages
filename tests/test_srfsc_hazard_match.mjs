import assert from 'node:assert/strict';
import test from 'node:test';

const { createGame, tryMatch, currentScore, isComplete, rateScore } = await import(
  '../assets/js/capstone/srfsc/hazardMatchRules.js'
);

const config = { roundIds: ['gutters', 'vents', 'grass'], startingScore: 100, penalty: 10 };
const ratings = [
  { min: 90, label: 'Firewise champion' },
  { min: 60, label: 'Getting there' },
  { min: 0, label: 'High risk' },
];

test('a hazard placed on its own fix is matched without a penalty', () => {
  const { correct, game } = tryMatch(createGame(config), 'gutters', 'gutters');
  assert.equal(correct, true);
  assert.deepEqual(game.matched, ['gutters']);
  assert.equal(currentScore(game), 100);
});

test('a wrong fix costs the penalty and leaves the hazard open', () => {
  const { correct, game } = tryMatch(createGame(config), 'gutters', 'vents');
  assert.equal(correct, false);
  assert.deepEqual(game.matched, []);
  assert.equal(currentScore(game), 90);
});

test('reusing a finished round is ignored instead of penalized', () => {
  const first = tryMatch(createGame(config), 'gutters', 'gutters').game;
  const again = tryMatch(first, 'vents', 'gutters');
  assert.equal(again.ignored, true);
  assert.equal(currentScore(again.game), 100);
});

test('the game completes once every round is matched and the score never drops below zero', () => {
  let game = createGame({ ...config, penalty: 60 });
  game = tryMatch(game, 'gutters', 'vents').game;
  game = tryMatch(game, 'gutters', 'grass').game;
  for (const id of config.roundIds) game = tryMatch(game, id, id).game;
  assert.equal(isComplete(game), true);
  assert.equal(currentScore(game), 0);
});

test('ratings pick the highest band the score reaches', () => {
  assert.equal(rateScore(100, ratings).label, 'Firewise champion');
  assert.equal(rateScore(70, ratings).label, 'Getting there');
  assert.equal(rateScore(0, ratings).label, 'High risk');
  assert.throws(() => rateScore(-1, ratings), /No Yard Walk rating/);
});

test('invalid configs fail fast', () => {
  assert.throws(() => createGame({ ...config, roundIds: [] }), /at least one round/);
  assert.throws(() => createGame({ ...config, roundIds: ['a', 'a'] }), /unique/);
  assert.throws(() => tryMatch(createGame(config), 'gutters', 'nope'), /Unknown Yard Walk round/);
});
