/**
 * progress.js
 * ─────────────────────────────────────────────────────────────────────────────
 * localStorage-based DSA progress tracker.
 * All progress is stored under a single key so it is fast to read/write.
 *
 * Storage format:
 *   "codenation-dsa-progress" → JSON → { completed: Set<number> }
 *
 * Public API:
 *   getProgress()              → { completed: number[] }
 *   markCompleted(id)          → void
 *   markIncomplete(id)         → void
 *   toggleComplete(id)         → boolean (new state: true = completed)
 *   isCompleted(id)            → boolean
 *   getCompletedIds()          → number[]
 *   getCompletedCount()        → number
 *   getCompletedByDifficulty(problems) → { Easy, Medium, Hard }
 *   clearProgress()            → void
 * ─────────────────────────────────────────────────────────────────────────────
 */

const STORAGE_KEY = 'codenation-dsa-progress';

/** Read raw data from localStorage — always returns a valid object. */
function _read() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { completed: [] };
    const parsed = JSON.parse(raw);
    // Guard: ensure completed is always an array
    if (!Array.isArray(parsed.completed)) parsed.completed = [];
    return parsed;
  } catch {
    return { completed: [] };
  }
}

/** Write data back to localStorage safely. */
function _write(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('[Progress] Failed to write to localStorage:', err);
  }
}

/**
 * Returns the current progress object.
 * @returns {{ completed: number[] }}
 */
export function getProgress() {
  return _read();
}

/**
 * Mark a problem as completed.
 * @param {number} id
 */
export function markCompleted(id) {
  const data = _read();
  if (!data.completed.includes(id)) {
    data.completed.push(id);
    _write(data);
  }
}

/**
 * Mark a problem as incomplete.
 * @param {number} id
 */
export function markIncomplete(id) {
  const data = _read();
  data.completed = data.completed.filter((cid) => cid !== id);
  _write(data);
}

/**
 * Toggle a problem's completion status.
 * @param {number} id
 * @returns {boolean} true if the problem is now completed
 */
export function toggleComplete(id) {
  if (isCompleted(id)) {
    markIncomplete(id);
    return false;
  } else {
    markCompleted(id);
    return true;
  }
}

/**
 * Check if a problem is completed.
 * @param {number} id
 * @returns {boolean}
 */
export function isCompleted(id) {
  return _read().completed.includes(id);
}

/**
 * Get all completed problem IDs.
 * @returns {number[]}
 */
export function getCompletedIds() {
  return _read().completed;
}

/**
 * Get total number of completed problems.
 * @returns {number}
 */
export function getCompletedCount() {
  return _read().completed.length;
}

/**
 * Get solved counts broken down by difficulty.
 * Requires the full problems array to cross-reference.
 * @param {Array} problems - full problems array from JSON
 * @returns {{ Easy: number, Medium: number, Hard: number }}
 */
export function getCompletedByDifficulty(problems) {
  const ids = new Set(_read().completed);
  const result = { Easy: 0, Medium: 0, Hard: 0 };
  for (const p of problems) {
    if (ids.has(p.id) && result[p.difficulty] !== undefined) {
      result[p.difficulty]++;
    }
  }
  return result;
}

/**
 * Clear all progress. Use with caution.
 */
export function clearProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('[Progress] Failed to clear localStorage:', err);
  }
}
