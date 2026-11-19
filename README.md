# Leonida Ledger — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/feriyansyahlubis/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/feriyansyahlubis/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Leonida Ledger** is an offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI — an entry for the make.fun bounty [“Build the best GTA 6 trophy guide”](https://make.fun/) (`gta6-trophy-guide-01`).

## What it does

- **Every trophy, exactly as PlayStation publishes it** — official name, description and grade (1 platinum, 2 gold, 6 silver, 46 bronze), with a guide in our own words beside each one.
- **Tracker** — a checklist saved in your browser (localStorage), with export to a file and import back, search, filters by kind (story, missable, collectibles, activities, online) and grade, and a per-trophy notes field.
- **Spoiler setting** — hides the names and descriptions of story trophies until they are earned.
- **Roadmap to the platinum** — six stages in play order, built from the official descriptions (story chapters and missions, collectible counts), with per-stage progress.
- **Missables flagged** — 15 trophies tied to one specific moment, set-up or second attempt, each with a note on why it can be missed.
- **Cited guidance** — every trophy's guide names its sources (Exophase's official trophy list and PSNProfiles' grades and PSN counts). Where the official description does not pin down a place or a step, the guide says so instead of inventing one.

## Offline by design

The app is static files under `app/` — no build step, no network requests at run time, no external fonts or images. Serve it with any static server:

```sh
node serve.ts        # then open http://localhost:8080
```

`?demo=1` seeds a sample 13-of-55 progress for screenshots and demos; `?view=roadmap|missables|tracker` opens a section directly; `?spoiler=0|1` sets the spoiler setting.

## How it is handed in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored `vendor/makefun-frontend.ts`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

- Exophase — official trophy list: <https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/>
- PSNProfiles — grades and PSN progress counts: <https://psnprofiles.com/trophies/43531-grand-theft-auto-vi>

An unofficial fan guide. Grand Theft Auto, GTA and Rockstar Games are trademarks of their owners; this guide is not affiliated with or endorsed by Rockstar Games or PlayStation. No Rockstar logo, official artwork or game screenshot is used anywhere.

## License

MIT — see [LICENSE](LICENSE).
