// ============================================
// hazardMatchGame.js
// RESPONSIBILITY: Connect the Yard Walk ocs__dnd markup to the game rules.
// Supports drag-and-drop and select-then-select (keyboard and touch),
// as the ocs__dnd grammar requires. Markup and text come from the page.
// ============================================
import { createGame, tryMatch, currentScore, isComplete, rateScore } from './hazardMatchRules.js';

function readRequiredNumber(board, attribute) {
  const value = Number(board.getAttribute(attribute));
  if (!Number.isFinite(value)) throw new Error(`Yard Walk board is missing a numeric ${attribute}.`);
  return value;
}

function mountYardWalk(board) {
  const card = board.parentElement;
  const hook = (name) => card.querySelector(`[data-hook="${name}"]`);
  const sources = [...board.querySelectorAll('.ocs__drag-btn')];
  const targets = [...board.querySelectorAll('.ocs__drop-btn')];
  const ratings = JSON.parse(hook('ratings').textContent);
  const config = {
    roundIds: sources.map((source) => source.dataset.round),
    startingScore: readRequiredNumber(board, 'data-starting-score'),
    penalty: readRequiredNumber(board, 'data-penalty'),
  };

  let game = createGame(config);
  let selected = null;

  const announce = (message) => { hook('status').textContent = message; };

  function select(source) {
    if (selected) selected.classList.remove('is-selected');
    if (selected) selected.setAttribute('aria-pressed', 'false');
    selected = source;
    if (source) {
      source.classList.add('is-selected');
      source.setAttribute('aria-pressed', 'true');
    }
  }

  function render() {
    const score = currentScore(game);
    hook('progress').textContent = `${game.matched.length} of ${config.roundIds.length} fixed · Score ${score}`;
    for (const button of [...sources, ...targets]) {
      const done = game.matched.includes(button.dataset.round);
      button.disabled = done;
      button.classList.toggle('is-filled', done && button.classList.contains('ocs__drop-btn'));
    }
    const result = hook('result');
    result.hidden = !isComplete(game);
    if (isComplete(game)) {
      const rating = rateScore(score, ratings);
      hook('rating-label').textContent = rating.label;
      const pill = hook('rating-score');
      pill.textContent = `${score} points`;
      pill.className = `ocs__status-pill ocs__status-pill--${rating.tone}`;
      hook('rating-text').textContent = rating.text;
    }
  }

  function place(source, target) {
    const outcome = tryMatch(game, source.dataset.round, target.dataset.round);
    select(null);
    if (outcome.ignored) return;
    game = outcome.game;
    if (outcome.correct) {
      announce(isComplete(game) ? `Yard cleared! ${target.dataset.tip}` : `Fixed. ${target.dataset.tip}`);
    } else {
      announce(`Not quite: that fix doesn't solve "${source.textContent.trim()}". Minus ${config.penalty} points.`);
    }
    render();
  }

  function reset() {
    game = createGame(config);
    select(null);
    announce('Pick a hazard, then pick its fix.');
    render();
  }

  for (const source of sources) {
    source.addEventListener('click', () => {
      select(selected === source ? null : source);
      if (selected) announce(`Selected "${source.textContent.trim()}". Now pick its fix.`);
    });
    source.addEventListener('dragstart', (event) => {
      select(source);
      event.dataTransfer.setData('text/plain', source.dataset.round);
      event.dataTransfer.effectAllowed = 'move';
    });
  }

  for (const target of targets) {
    target.addEventListener('click', () => {
      if (!selected) {
        announce('Pick a hazard first, then its fix.');
        return;
      }
      place(selected, target);
    });
    target.addEventListener('dragover', (event) => {
      if (target.disabled) return;
      event.preventDefault();
      target.classList.add('is-over');
    });
    target.addEventListener('dragleave', () => target.classList.remove('is-over'));
    target.addEventListener('drop', (event) => {
      event.preventDefault();
      target.classList.remove('is-over');
      const source = sources.find((candidate) => candidate.dataset.round === event.dataTransfer.getData('text/plain'));
      if (source) place(source, target);
    });
  }

  hook('reset').addEventListener('click', reset);
  render();
}

document.querySelectorAll('[data-hook="srfsc-yard-walk"]').forEach(mountYardWalk);
