// Leonida Ledger entrypoint (Node 22, standard library only).
//
// The guide itself is plain static files under app/: index.html, its ES
// modules, its stylesheet and data/trophies.json. There is no build step —
// the files are handed in exactly as they sit in this repository.
//
// This program copies app/ and screenshots/ from beside this file into the
// output directory and writes dossier.json there, using the kit's vendored
// make.fun library (vendor/makefun-frontend.ts, unchanged). The scorer
// rebuilds the dossier with its own copy of that library and compares the
// two byte for byte, so the vendored file must stay untouched.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the guide locally with `node serve.ts` and open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// Caps from the competition's gate (reference/gate.json): at most 4
// screenshots of at most 256 KiB each, app/ at most 993 files and
// directories and 48 MiB in all, and the dossier text at most 160 KiB.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
