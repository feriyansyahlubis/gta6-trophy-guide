// Roadmap and missables pages, built from the official descriptions:
// story chapters and missions, collectible counts, and the one-shot moments.
import { ROADMAP_STAGES, gradeLabel } from './data.js';

export function renderRoadmap(doc, state, listElement, onSelect) {
  listElement.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const stageTrophies = doc.trophies.filter((trophy) => trophy.stage === stage.stage);
    const earned = stageTrophies.filter((trophy) => state.earned.has(trophy.name)).length;
    const item = document.createElement('li');
    item.className = 'roadmap-stage';
    const num = document.createElement('span');
    num.className = 'stage-num';
    num.textContent = String(stage.stage);
    const body = document.createElement('div');
    const heading = document.createElement('h3');
    heading.textContent = stage.title;
    const text = document.createElement('p');
    text.textContent = stage.text;
    const tags = document.createElement('div');
    tags.className = 'stage-trophies';
    for (const trophy of stageTrophies) {
      const tag = document.createElement('button');
      tag.type = 'button';
      tag.className = 'tag' + (state.earned.has(trophy.name) ? ' done' : '');
      tag.textContent = `${trophy.name} · ${gradeLabel(trophy.grade)}`;
      tag.addEventListener('click', () => onSelect(trophy.name));
      tags.append(tag);
    }
    body.append(heading, text, tags);
    const count = document.createElement('p');
    count.className = 'stage-count';
    const strong = document.createElement('strong');
    strong.textContent = `${earned}/${stageTrophies.length}`;
    count.append(strong, document.createTextNode(' trophies earned'));
    item.append(num, body, count);
    listElement.append(item);
  }
}

export function renderMissables(doc, state, listElement, onSelect) {
  const missable = doc.trophies.filter((trophy) => trophy.missable);
  listElement.replaceChildren();
  for (const trophy of missable) {
    const earned = state.earned.has(trophy.name);
    const item = document.createElement('li');
    item.className = 'missable-item';
    const check = document.createElement('button');
    check.type = 'button';
    check.className = 'trophy-check' + (earned ? ' earned' : '');
    check.textContent = earned ? '✓' : '';
    check.setAttribute('aria-label', earned ? `Mark ${trophy.name} as not earned` : `Mark ${trophy.name} as earned`);
    check.addEventListener('click', () => onSelect(trophy.name, true));
    const body = document.createElement('div');
    const name = document.createElement('p');
    name.className = 'trophy-name';
    name.textContent = trophy.name;
    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = trophy.description;
    const note = document.createElement('p');
    note.className = 'missable-note';
    note.textContent = trophy.missableNote ?? 'Tied to one specific moment — do it when it appears.';
    body.append(name, desc, note);
    const gradeWrap = document.createElement('span');
    const dot = document.createElement('span');
    dot.className = `grade-dot ${trophy.grade}`;
    const gradeText = document.createElement('span');
    gradeText.className = 'grade-label';
    gradeText.textContent = trophy.grade;
    gradeWrap.append(dot, gradeText);
    item.append(check, body, gradeWrap);
    listElement.append(item);
  }
}

export function renderSources(doc, sourceListElement, factsElement) {
  sourceListElement.replaceChildren();
  for (const source of doc.listSources ?? []) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = source.name;
    item.append(link, document.createTextNode(' — the official PlayStation 5 trophy list: names, descriptions, grades and PSN counts.'));
    sourceListElement.append(item);
  }
  const extra = document.createElement('li');
  extra.textContent = 'This guide itself — every guide text is written in our own words for this entry, from the official descriptions above. Where a description does not pin down a place or a step, the guide says so instead of inventing one.';
  sourceListElement.append(extra);
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of doc.trophies) counts[trophy.grade] += 1;
  const facts = [
    ['Trophies', String(doc.trophies.length)],
    ['Platinum', String(counts.platinum)],
    ['Gold', String(counts.gold)],
    ['Silver', String(counts.silver)],
    ['Bronze', String(counts.bronze)],
    ['Missable', String(doc.trophies.filter((trophy) => trophy.missable).length)],
    ['Hidden on PSN', '28 of 55'],
    ['Online trophies', '0'],
  ];
  factsElement.replaceChildren();
  for (const [label, value] of facts) {
    const wrap = document.createElement('div');
    const term = document.createElement('dt');
    term.textContent = label;
    const def = document.createElement('dd');
    def.textContent = value;
    wrap.append(term, def);
    factsElement.append(wrap);
  }
}
