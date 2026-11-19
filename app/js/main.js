// Leonida Ledger boot: loads the trophy data, wires the tabs, filters,
// spoiler setting, export/import and the detail pane together.
import { loadTrophyData } from './data.js';
import { loadSavedState, saveState, exportProgress, importProgressFile, demoEarnedNames } from './store.js';
import { buildKindFilters, renderProgress, renderNextUp, renderTrophyList, renderDetailPane } from './views.js';
import { renderRoadmap, renderMissables, renderSources } from './roadmap.js';

const VIEWS = ['tracker', 'roadmap', 'missables', 'sources'];

const elements = {
  earnedCount: document.getElementById('earnedCount'),
  progressFill: document.getElementById('progressFill'),
  progressBar: document.getElementById('progressBar'),
  gradeCounts: document.getElementById('gradeCounts'),
  platinumNote: document.getElementById('platinumNote'),
  missableCount: document.getElementById('missableCount'),
  searchInput: document.getElementById('searchInput'),
  kindFilters: document.getElementById('kindFilters'),
  gradeFilter: document.getElementById('gradeFilter'),
  spoilerToggle: document.getElementById('spoilerToggle'),
  hideEarnedToggle: document.getElementById('hideEarnedToggle'),
  exportBtn: document.getElementById('exportBtn'),
  importInput: document.getElementById('importInput'),
  resetBtn: document.getElementById('resetBtn'),
  nextUp: document.getElementById('nextUp'),
  trophyList: document.getElementById('trophyList'),
  listMeta: document.getElementById('listMeta'),
  detailPane: document.getElementById('detailPane'),
  roadmapList: document.getElementById('roadmapList'),
  missableList: document.getElementById('missableList'),
  sourceList: document.getElementById('sourceList'),
  factsList: document.getElementById('factsList'),
};

const state = loadSavedState();
const filters = { query: '', kind: 'all', grade: 'all' };
let doc = null;
let selectedName = null;
let currentView = 'tracker';

function showView(view) {
  currentView = VIEWS.includes(view) ? view : 'tracker';
  for (const name of VIEWS) {
    document.getElementById(`view-${name}`).classList.toggle('is-visible', name === currentView);
    document.getElementById(`tab-${name}`).classList.toggle('is-active', name === currentView);
  }
  const url = new URL(window.location.href);
  url.searchParams.set('view', currentView);
  window.history.replaceState(null, '', url);
  if (currentView === 'roadmap') renderRoadmap(doc, state, elements.roadmapList, selectTrophy);
  if (currentView === 'missables') renderMissables(doc, state, elements.missableList, selectTrophy);
}

function renderAll() {
  renderProgress(doc, state, elements);
  renderNextUp(doc, state, elements.nextUp, selectTrophy);
  renderTrophyList(doc, state, filters, elements.trophyList, elements.listMeta, selectedName, selectTrophy, toggleEarned);
  renderDetailPane(doc, state, elements.detailPane, selectedName, toggleEarned);
  if (currentView === 'roadmap') renderRoadmap(doc, state, elements.roadmapList, selectTrophy);
  if (currentView === 'missables') renderMissables(doc, state, elements.missableList, selectTrophy);
}

function selectTrophy(name, toggle = false) {
  selectedName = name;
  if (toggle) toggleEarned(name);
  else {
    showView('tracker');
    renderAll();
  }
  const row = elements.trophyList.querySelector('.trophy-row.is-selected');
  if (row) row.scrollIntoView({ block: 'nearest' });
}

function toggleEarned(name) {
  if (state.earned.has(name)) state.earned.delete(name);
  else state.earned.add(name);
  saveState(state);
  renderAll();
}

async function boot() {
  doc = await loadTrophyData();
  elements.missableCount.textContent = String(doc.trophies.filter((trophy) => trophy.missable).length);
  const params = new URLSearchParams(window.location.search);
  if (params.get('demo') === '1' && state.earned.size === 0) {
    for (const name of demoEarnedNames()) state.earned.add(name);
    saveState(state);
  }
  if (params.get('spoiler') === '1') state.spoiler = true;
  if (params.get('spoiler') === '0') state.spoiler = false;
  selectedName = 'The Shootist';
  if (params.get('trophy')) {
    const named = doc.trophies.find((trophy) => trophy.name === params.get('trophy'));
    if (named) selectedName = named.name;
  }
  elements.spoilerToggle.checked = state.spoiler;
  elements.hideEarnedToggle.checked = state.hideEarned;
  renderSources(doc, elements.sourceList, elements.factsList);
  const refreshKindFilters = () => {
    buildKindFilters(elements.kindFilters, filters.kind, (kind) => {
      filters.kind = kind;
      refreshKindFilters();
      renderAll();
    });
  };
  refreshKindFilters();
  for (const name of VIEWS) {
    document.getElementById(`tab-${name}`).addEventListener('click', () => showView(name));
  }
  elements.searchInput.addEventListener('input', () => {
    filters.query = elements.searchInput.value;
    renderAll();
  });
  elements.gradeFilter.addEventListener('change', () => {
    filters.grade = elements.gradeFilter.value;
    renderAll();
  });
  elements.spoilerToggle.addEventListener('change', () => {
    state.spoiler = elements.spoilerToggle.checked;
    saveState(state);
    renderAll();
  });
  elements.hideEarnedToggle.addEventListener('change', () => {
    state.hideEarned = elements.hideEarnedToggle.checked;
    saveState(state);
    renderAll();
  });
  elements.exportBtn.addEventListener('click', () => exportProgress(state));
  elements.importInput.addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const count = await importProgressFile(file, state);
      elements.spoilerToggle.checked = state.spoiler;
      elements.hideEarnedToggle.checked = state.hideEarned;
      window.alert(`Imported ${count} earned trophies.`);
      renderAll();
    } catch (error) {
      window.alert(`Could not import that file: ${error.message}`);
    }
    event.target.value = '';
  });
  elements.resetBtn.addEventListener('click', () => {
    if (!window.confirm('Clear all earned trophies, notes and settings?')) return;
    state.earned.clear();
    state.notes = {};
    saveState(state);
    renderAll();
  });
  const initialView = params.get('view');
  if (initialView && VIEWS.includes(initialView)) showView(initialView);
  renderAll();
}

boot().catch((error) => {
  elements.trophyList.replaceChildren();
  const item = document.createElement('li');
  item.className = 'empty-state';
  item.textContent = `The guide could not load its trophy data: ${error.message}`;
  elements.trophyList.append(item);
});
