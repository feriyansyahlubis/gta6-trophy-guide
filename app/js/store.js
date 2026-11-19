// Saved progress: localStorage checklist, notes, settings, export and import.
// Nothing leaves the browser except the export file the reader downloads.
export const STORAGE_KEY = 'leonida-ledger-v1';
export const EXPORT_VERSION = 1;

const DEMO_EARNED = [
  'Just Like Paradise', 'Paradise Lost', 'T**s Ass Drug Money', 'Vice City, Baby!',
  'Trust', 'Break the Bank', 'Stick Fiddler', 'Master of None',
  'Baited My Tackle', 'Top Fun', 'The Goodtime State', 'Treat Yo Self', 'On the Spot',
];

export function demoEarnedNames() {
  return [...DEMO_EARNED];
}

export function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    return {
      earned: new Set(Array.isArray(parsed.earned) ? parsed.earned : []),
      notes: parsed.notes && typeof parsed.notes === 'object' ? parsed.notes : {},
      spoiler: parsed.spoiler !== false,
      hideEarned: parsed.hideEarned === true,
    };
  } catch {
    return freshState();
  }
}

export function freshState() {
  return { earned: new Set(), notes: {}, spoiler: true, hideEarned: false };
}

export function saveState(state) {
  const payload = {
    app: 'leonida-ledger',
    version: EXPORT_VERSION,
    earned: [...state.earned],
    notes: state.notes,
    spoiler: state.spoiler,
    hideEarned: state.hideEarned,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function exportProgress(state) {
  const payload = saveState(state);
  payload.exportedAt = new Date().toISOString();
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'leonida-ledger-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return payload;
}

export async function importProgressFile(file, state) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const earned = Array.isArray(parsed.earned) ? parsed.earned : parsed;
  if (!Array.isArray(earned)) throw new Error('That file has no earned list.');
  const next = freshState();
  next.earned = new Set(earned.filter((name) => typeof name === 'string'));
  if (parsed.notes && typeof parsed.notes === 'object') next.notes = parsed.notes;
  if (typeof parsed.spoiler === 'boolean') next.spoiler = parsed.spoiler;
  if (typeof parsed.hideEarned === 'boolean') next.hideEarned = parsed.hideEarned;
  Object.assign(state, next);
  saveState(state);
  return next.earned.size;
}
