# FanDistance

**Representing from everywhere.** A mobile web app that recognizes fans who represent their teams, whether they're at the venue or somewhere else.

This is the V2 storyboard integration pass. The approved boards live in [`docs/storyboards/`](docs/storyboards) and are the product spec:

| Board | Implemented as |
| --- | --- |
| `01-brand-launch` | Launch sequence (`src/screens/Launch.tsx`, `src/components/FDMark.tsx`) |
| `02-ticket-artwork-journey` | Ticket artifact + lifecycle (`src/components/Ticket.tsx`, `TicketArt.tsx`) |
| `03-v2-end-to-end` | Notification → print → Ticket + Seat → Game Day Hub → recap |
| `04-passport` | Passport, Ticket Book, Game Story, Recognition, Memories, Seasons, Teams |
| `05-bench-locker-room` | The Bench (inside Game Day) and Locker Room (inside Passport) |
| `06-orioles-ticket-art-concepts` | Test-team (Baltimore) ticket artwork (`src/data/artwork.ts`, `public/art/orioles/`) |

## Run

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # ticket lifecycle rules
npm run build
```

## Architecture (locked)

- Global nav is exactly **HOME | GAME DAY | PASSPORT**.
- **The Bench** exists only inside an active Game Day (`/gameday/:gameId/bench`).
- **Locker Room** exists only inside Passport (`/passport/locker-room`).
- No onboarding or auth gate in this review build.

## Ticket lifecycle

**One game = one ticket.** `issueTicket` does nothing if the game already has a ticket. After that, the ticket only gets new layers added. Its artwork is frozen when it's issued:

```
ISSUED → CHECKED IN (stamp) → GAME FINAL (score added) → MILESTONE MOMENT (marks, only when earned)
```

The ticket is issued the moment the fan taps the notification or an eligible game, so leaving mid-print keeps it. The ticket issued before the game becomes the permanent Ticket Book entry in Passport. See `src/state/store.tsx` and `src/state/store.test.ts`.

## Naming and theme (v1.1)

A team is its city, and its full name is city plus sport: Baltimore Baseball, Carolina Hockey. Tickets read `AWAY @ HOME` by city, and short labels use abbreviations (BAL, BOS). Venue names stay as real place names. Every consumer screen uses the dark navy and orange theme; only the reviewer demo sheet stays light.

Scores are always written from the fan's side ("W 7–2 vs New York"), and counts pluralize correctly. The helpers for both are in `src/state/format.ts`.

## Ticket artwork

Baltimore Baseball tickets use the 24 approved Baltimore art concepts. Each game's concept is chosen when the ticket is issued and never changes. Opening Day goes on each season opener, July 4th Fireworks on July 4 games, Rivalry Series on the Yankees games, and Giveaway Day on giveaway nights. Every other game gets one of the remaining concepts, picked the same way each time.

The images in `public/art/orioles/` are cut from the approved concept sheet, so they are low resolution (about 185×113 px each). To swap in final artwork, replace a file with the same name, or add a new entry to `ORIOLES_ART`. Concept 24, Last Home Game, isn't included yet because the supplied sheet has a screen overlay across it. Other teams still use the generated posters in `TicketArt.tsx`.

## Season pins

Pins are collectible memories from a season. Each one is pinned to the ticket of the game that earned it, and they're collected per team and season on the Pin Board (`/passport/pins`). A fan can earn:

- **First Game:** the first game represented that season
- **10th, 25th and 50th Game:** of that season
- **Fan of the Game:** when the team spotlights the fan
- **Rivalry Game:** the first game against the team's rival
- **First Road Game** of the season
- **July 4th**

Every pin except Fan of the Game is added once the game is final. Pins recognize participation. They aren't points and they aren't ranked. The rules are in `src/data/pins.ts`, and `src/components/PinBadge.tsx` draws the enamel-pin art.

## Passport jump bar and Team Perks

Passport home runs in this order: Stats, Recognition, Team perks, Last game, Ticket book, Big games, Seasons, Teams, Pins, Memories, Locker Room. A sticky jump bar under the header (`PassportJump`) scrolls to each section and highlights the section you're in as you scroll. Team Perks (`TeamPerks`) previews what a season's attendance record could earn at 10, 25 and 50 games. It's labeled as a preview because no team offers perks yet.

## Demo controls

An orange dashed **DEMO** tab on the right edge (or press **D**) opens reviewer tools. They're kept separate from the consumer UI. The first time the app opens on a device, a short hint points to the tab.

- **A** Baltimore vs Boston (first run: Section 330 · Row 9 · Seat 14, 8,315 joined); tonight is the fan's 10th Baltimore Baseball game of 2027
- **B** Standing Room Only
- **C** Multiple eligible teams/games
- **D** Completed game
- **E** Milestone game (end it to add the 50-game, streak and giveaway marks)
- **F** Established fan Passport (6 teams, 5 leagues, 2 seasons, 37 games)
- Game state controls (Start / Game final / + Historic mark / ★ Fan of the Game), fan location (at / beyond the venue), and **Restart demo**

Every **Restart demo**, and every scenario you pick, is a fresh run with new ticket artwork, a new section, row and seat, a new crowd count, a new final score, and different past tickets in Passport. The artwork never repeats the ticket just shown. A brand-new install starts on the canonical storyboard game (Section 330 · Row 9 · Seat 14, 8,315 joined), and so do the unit tests. Scenario rules hold on every run: tonight is still the 10th game of 2027 in A, Standing Room Only in B, and game #50 in E.

State persists in `localStorage`, so a reload keeps tickets and seats.

## Install on a phone

The app is a Progressive Web App (PWA). Open it in Safari (iPhone) or Chrome (Android) and choose **Add to Home Screen**. It then opens full screen with the FanDistance icon and works offline, because a service worker caches the whole build. The claude.ai review link can't be installed; use the GitHub Pages address once Pages is turned on (below).

## CI and GitHub Pages

`.github/workflows/ci.yml` runs on every push and pull request: typecheck, unit tests, build, then the v1.1 checklist in Chromium at 390 px. Checklist screenshots are kept as a run artifact. Pushes to `main` also publish `dist/` to GitHub Pages at `https://tarheelmm.github.io/fandistance/`. This needs a one-time setting: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Storyboard acceptance

```bash
npm run build && npx vite preview --port 4173 &
npm run shots
npm run verify:v11   # v1.1 handoff checklist, scenario A at 390 px
```

`scripts/acceptance-shots.mjs` drives the real app at 390×844 with simulated safe areas. It captures every storyboard screen, and captures the launch and print sequences frame by frame using a frozen clock and scrubbed CSS animations. `scripts/compare-sheets.mjs` then places each render beside its storyboard crop in `acceptance/compare/`.
