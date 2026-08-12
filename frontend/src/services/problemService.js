/**
 * problemService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure query functions over the static problems.json dataset.
 * All operations are O(n) or better — fast for datasets up to 2000+ problems.
 * No API calls. No side effects. Fully tree-shakeable.
 *
 * Public API:
 *   getAllProblems()
 *   getProblemBySlug(slug)
 *   getProblemById(id)
 *   getProblemsByTopic(topicId)
 *   getProblemsByDifficulty(difficulty)
 *   searchProblems(query)
 *   getTopicsWithProblems(topicsData)
 *   getTotalByDifficulty()
 *   getProblemsByIds(ids[])
 * ─────────────────────────────────────────────────────────────────────────────
 */

import problemsData from '../data/problems.json';
import topicsData   from '../data/topics.json';

// ── Frozen copies – prevents accidental mutation ──────────────────────────────
const PROBLEMS = Object.freeze(problemsData);
const TOPICS   = Object.freeze(topicsData);

// ── Lookup maps built once at module load (O(1) access) ───────────────────────
const _bySlug = new Map(PROBLEMS.map((p) => [p.slug, p]));
const _byId   = new Map(PROBLEMS.map((p) => [p.id, p]));

/**
 * Returns a shallow copy of the full problems array.
 * @returns {object[]}
 */
export function getAllProblems() {
  return [...PROBLEMS];
}

/**
 * Find a problem by its URL slug. Returns null if not found.
 * @param {string} slug
 * @returns {object|null}
 */
export function getProblemBySlug(slug) {
  return _bySlug.get(slug) ?? null;
}

/**
 * Find a problem by its numeric ID. Returns null if not found.
 * @param {number|string} id
 * @returns {object|null}
 */
export function getProblemById(id) {
  return _byId.get(Number(id)) ?? null;
}

/**
 * Get all problems that belong to a topic.
 * @param {string} topicId - e.g. "arrays", "graphs"
 * @returns {object[]}
 */
export function getProblemsByTopic(topicId) {
  if (!topicId) return [...PROBLEMS];
  return PROBLEMS.filter((p) => p.topic === topicId).sort((a, b) => a.order - b.order);
}

/**
 * Get all problems with a given difficulty.
 * @param {'Easy'|'Medium'|'Hard'} difficulty
 * @returns {object[]}
 */
export function getProblemsByDifficulty(difficulty) {
  if (!difficulty) return [...PROBLEMS];
  return PROBLEMS.filter((p) => p.difficulty === difficulty);
}

/**
 * Case-insensitive search across title, subTopic, tags, and companies.
 * @param {string} query
 * @returns {object[]}
 */
export function searchProblems(query) {
  if (!query || !query.trim()) return [...PROBLEMS];
  const q = query.trim().toLowerCase();
  return PROBLEMS.filter((p) => {
    if (p.title.toLowerCase().includes(q)) return true;
    if (p.subTopic?.toLowerCase().includes(q)) return true;
    if (p.tags?.some((t) => t.toLowerCase().includes(q))) return true;
    if (p.companies?.some((c) => c.toLowerCase().includes(q))) return true;
    return false;
  });
}

/**
 * Returns topics array enriched with their problems list (sorted by order).
 * Useful for rendering the full DSA sheet with sections.
 * @returns {Array<{ topic: object, problems: object[] }>}
 */
export function getTopicsWithProblems() {
  // Group problems by topic
  const byTopic = new Map();
  for (const p of PROBLEMS) {
    if (!byTopic.has(p.topic)) byTopic.set(p.topic, []);
    byTopic.get(p.topic).push(p);
  }
  // Sort each group by order
  for (const [, arr] of byTopic) {
    arr.sort((a, b) => a.order - b.order);
  }
  // Return topics that have at least one problem, in topic order
  return TOPICS
    .filter((t) => byTopic.has(t.id))
    .map((t) => ({
      topic: t,
      problems: byTopic.get(t.id) || [],
    }));
}

/**
 * Total problem count broken down by difficulty.
 * @returns {{ Easy: number, Medium: number, Hard: number, Total: number }}
 */
export function getTotalByDifficulty() {
  const counts = { Easy: 0, Medium: 0, Hard: 0, Total: PROBLEMS.length };
  for (const p of PROBLEMS) {
    if (counts[p.difficulty] !== undefined) counts[p.difficulty]++;
  }
  return counts;
}

/**
 * Get a batch of problems by an array of IDs (e.g. recently solved).
 * @param {number[]} ids
 * @returns {object[]}
 */
export function getProblemsByIds(ids) {
  return ids.map((id) => _byId.get(Number(id))).filter(Boolean);
}

// Re-export raw data for components that need direct access
export { TOPICS as allTopics };
