// Checklist and detail pane: the tracker view.
// The list shows every trophy with its official name, description and grade;
// the pane beside it shows the selected trophy's guide, steps and sources.
import { gradeLabel } from './data.js';
import { applyFilters, isSpoilerHidden, spoilerPlaceholder, nextUpTrophies } from './filters.js';
import { saveState } from './store.js';

const KIND_ORDER = ['all', 'story', 'missable', 'collectibles', 'activities', 'online'];

export function buildKindFilters(container, current, onChange) {
  container.replaceChildren();
  const labels = { all: 'All', story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online' };
  for (const kind of KIND_ORDER) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'kind-pill' + (kind === current ? ' is-active' : '');
    button.textContent = labels[kind];
    button.setAttribute('aria-pressed', String(kind === current));
    button.addEventListener('click', () => onChange(kind));
    container.append(button);
  }
}

export function renderProgress(doc, state, elements) {
  const total = doc.trophies.length;
  const earned = state.earned.size;
  elements.earnedCount.textContent = String(earned);
  elements.progressFill.style.width = `${Math.round((earned / total) * 100)}%`;
  elements.progressBar.setAttribute('aria-valuenow', String(earned));
  const byGrade = {};
  for (const trophy of doc.trophies) {
    if (!state.earned.has(trophy.name)) continue;
    byGrade[trophy.grade] = (byGrade[trophy.grade] ?? 0) + 1;
  }
  const totals = {};
  for (const trophy of doc.trophies) totals[trophy.grade] = (totals[trophy.grade] ?? 0) + 1;
  elements.gradeCounts.textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((grade) => `${byGrade[grade] ?? 0}/${totals[grade] ?? 0} ${gradeLabel(grade)}`)
    .join(' · ');
  elements.platinumNote.textContent = earned === total
    ? 'Platinum earned — you are a Leonida Legend.'
    : `Platinum unlocks at ${total} of ${total} — ${total - earned} to go.`;
}

export function renderNextUp(doc, state, element, onSelect) {
  const next = nextUpTrophies(doc.trophies, state, 3);
  element.replaceChildren();
  if (next.length === 0) {
    element.textContent = 'Every trophy is earned. Platinum complete.';
    return;
  }
  const strong = document.createElement('strong');
  strong.textContent = 'Next up: ';
  element.append(strong, document.createTextNode('work through the roadmap in order — '));
  next.forEach((trophy, index) => {
    if (index > 0) element.append(document.createTextNode(index === next.length - 1 ? ', then ' : ', '));
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = trophy.name + (trophy.missable ? ' (missable)' : '');
    button.addEventListener('click', () => onSelect(trophy.name));
    element.append(button);
  });
  element.append(document.createTextNode('.'));
}

export function renderTrophyList(doc, state, filters, listElement, metaElement, selectedName, onSelect, onToggle) {
  const shown = applyFilters(doc.trophies, state, filters.query, filters.kind, filters.grade);
  metaElement.textContent = `Showing ${shown.length} of ${doc.trophies.length} trophies` +
    (filters.kind === 'online' ? ' — the official list has no online trophies.' : '') +
    (state.earned.size ? ` · ${state.earned.size} earned.` : '');
  listElement.replaceChildren();
  if (shown.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = filters.kind === 'online'
      ? 'No online trophies: the official PlayStation 5 list has no online-only trophy, so there is nothing to track here.'
      : 'No trophies match these filters. Clear the search or pick another kind.';
    listElement.append(empty);
    return;
  }
  for (const trophy of shown) {
    const earned = state.earned.has(trophy.name);
    const hidden = isSpoilerHidden(trophy, state);
    const shownTrophy = hidden ? spoilerPlaceholder() : trophy;
    const item = document.createElement('li');
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'trophy-row' + (earned ? ' is-earned' : '') + (trophy.name === selectedName ? ' is-selected' : '');
    row.setAttribute('aria-pressed', String(earned));
    const check = document.createElement('span');
    check.className = 'trophy-check';
    check.setAttribute('aria-hidden', 'true');
    check.textContent = earned ? '✓' : '';
    check.addEventListener('click', (event) => {
      event.stopPropagation();
      onToggle(trophy.name);
    });
    const body = document.createElement('span');
    const name = document.createElement('span');
    name.className = 'trophy-name' + (hidden ? ' hidden-trophy' : '');
    name.textContent = shownTrophy.name;
    const desc = document.createElement('span');
    desc.className = 'trophy-desc';
    desc.textContent = shownTrophy.description;
    body.append(name, desc);
    if (!hidden) {
      const tags = document.createElement('span');
      tags.className = 'trophy-tags';
      for (const kind of trophy.kind) {
        const tag = document.createElement('span');
        tag.className = `tag ${kind}`;
        tag.textContent = kind;
        tags.append(tag);
      }
      if (trophy.missable) {
        const tag = document.createElement('span');
        tag.className = 'tag missable';
        tag.textContent = 'Missable';
        tags.append(tag);
      }
      if (trophy.target) {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = `Target: ${trophy.target}`;
        tags.append(tag);
      }
      body.append(tags);
    }
    const gradeWrap = document.createElement('span');
    const dot = document.createElement('span');
    dot.className = `grade-dot ${trophy.grade}`;
    const gradeText = document.createElement('span');
    gradeText.className = 'grade-label';
    gradeText.textContent = trophy.grade;
    gradeWrap.append(dot, gradeText);
    row.append(check, body, gradeWrap);
    row.addEventListener('click', () => onSelect(trophy.name));
    item.append(row);
    listElement.append(item);
  }
}

export function renderDetailPane(doc, state, pane, trophyName, onToggle) {
  const trophy = doc.trophies.find((item) => item.name === trophyName) ?? doc.trophies[0];
  const earned = state.earned.has(trophy.name);
  const hidden = isSpoilerHidden(trophy, state);
  pane.replaceChildren();
  const heading = document.createElement('h2');
  heading.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  if (hidden) heading.classList.add('hidden-trophy');
  const gradeRow = document.createElement('p');
  gradeRow.className = 'detail-grade';
  const dot = document.createElement('span');
  dot.className = `grade-dot ${trophy.grade}`;
  gradeRow.append(dot, document.createTextNode(`${gradeLabel(trophy.grade)} trophy · Roadmap stage ${trophy.stage} of 6`));
  pane.append(heading, gradeRow);
  if (hidden) {
    const note = document.createElement('p');
    note.className = 'detail-desc';
    note.textContent = 'This is a story trophy, hidden by the spoiler setting until it is earned. Tick it off in the list when you earn it — or turn the spoiler setting off to reveal it.';
    pane.append(note);
  } else {
    const descLabel = document.createElement('p');
    descLabel.className = 'detail-desc-label';
    descLabel.textContent = 'Official description';
    const desc = document.createElement('p');
    desc.className = 'detail-desc';
    desc.textContent = trophy.description;
    pane.append(descLabel, desc);
  }
  if (trophy.missable && !hidden) {
    const flag = document.createElement('p');
    flag.className = 'detail-flag';
    const strong = document.createElement('strong');
    strong.textContent = 'Missable — ';
    flag.append(strong, document.createTextNode(trophy.missableNote ?? 'Tied to one specific moment. Do it when it appears.'));
    pane.append(flag);
  }
  if (!hidden) {
    const guideLabel = document.createElement('p');
    guideLabel.className = 'detail-guide-label';
    guideLabel.textContent = 'Guide — our own words';
    const guide = document.createElement('p');
    guide.className = 'detail-guide';
    guide.textContent = trophy.guide;
    pane.append(guideLabel, guide);
    if (trophy.steps?.length) {
      const steps = document.createElement('ol');
      steps.className = 'detail-steps';
      for (const step of trophy.steps) {
        const li = document.createElement('li');
        li.textContent = step;
        steps.append(li);
      }
      pane.append(steps);
    }
    if (trophy.target) {
      const target = document.createElement('p');
      target.className = 'detail-target';
      const strong = document.createElement('strong');
      strong.textContent = `Target: ${trophy.target} ${trophy.targetLabel ?? ''}`;
      target.append(strong, document.createTextNode(' — the count PlayStation tracks for this trophy.'));
      pane.append(target);
    }
  }
  const actions = document.createElement('div');
  actions.className = 'detail-actions';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'primary';
  toggle.textContent = earned ? 'Mark as not earned' : 'Mark as earned';
  toggle.addEventListener('click', () => onToggle(trophy.name));
  actions.append(toggle);
  pane.append(actions);
  const noteWrap = document.createElement('div');
  noteWrap.className = 'detail-note';
  const noteLabel = document.createElement('label');
  noteLabel.setAttribute('for', 'trophyNote');
  noteLabel.textContent = 'Your note';
  const note = document.createElement('textarea');
  note.id = 'trophyNote';
  note.placeholder = 'Where you found it, what worked, what to retry…';
  note.value = state.notes[trophy.name] ?? '';
  note.addEventListener('input', () => {
    if (note.value.trim()) state.notes[trophy.name] = note.value;
    else delete state.notes[trophy.name];
    saveState(state);
  });
  noteWrap.append(noteLabel, note);
  pane.append(noteWrap);
  const sources = document.createElement('p');
  sources.className = 'detail-sources';
  const sourcesStrong = document.createElement('strong');
  sourcesStrong.textContent = 'Sources: ';
  sources.append(sourcesStrong);
  const sourceLinks = [
    { name: 'Exophase — official trophy list', url: 'https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/' },
    { name: 'PSNProfiles — grades & PSN counts', url: 'https://psnprofiles.com/trophies/43531-grand-theft-auto-vi' },
  ];
  sourceLinks.forEach((source, index) => {
    if (index > 0) sources.append(document.createTextNode(' · '));
    const link = document.createElement('a');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = source.name;
    sources.append(link);
  });
  sources.append(document.createTextNode('. Guide: our own advice from the official description, not yet checked in the game.'));
  pane.append(sources);
}
