// Filters, search and the spoiler rule: which trophies the list shows.
// The spoiler rule hides a story trophy's name and description until it is
// earned; the trophy still counts in the totals, and its row stays visible
// so the checklist keeps its shape.
export function applyFilters(trophies, state, query, kind, grade) {
  const needle = query.trim().toLowerCase();
  return trophies.filter((trophy) => {
    if (state.hideEarned && state.earned.has(trophy.name)) return false;
    if (grade !== 'all' && trophy.grade !== grade) return false;
    if (kind === 'missable' && !trophy.missable) return false;
    if (kind === 'online') return false;
    if (kind !== 'all' && kind !== 'missable' && !trophy.kind.includes(kind)) return false;
    if (needle) {
      const haystack = [trophy.name, trophy.description, trophy.guide, ...(trophy.steps ?? [])].join(' ').toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    return true;
  });
}

export function isSpoilerHidden(trophy, state) {
  return state.spoiler && trophy.spoiler && !state.earned.has(trophy.name);
}

export function spoilerPlaceholder() {
  return {
    name: 'Hidden story trophy',
    description: 'Hidden until earned — turn off “Hide story spoilers” to reveal it, or earn it in the story.',
  };
}

export function nextUpTrophies(trophies, state, count = 3) {
  const unearned = trophies.filter((trophy) => !state.earned.has(trophy.name));
  const byStage = (a, b) => (a.stage - b.stage) || (a.missable === b.missable ? 0 : a.missable ? -1 : 1);
  const ordered = [...unearned].sort(byStage);
  return ordered.slice(0, count);
}
