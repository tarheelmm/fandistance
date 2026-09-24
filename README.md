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
| `06-orioles-ticket-art-concepts` | Orioles ticket artwork (`src/data/artwork.ts`, `public/art/orioles/`) |

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

## Ticket artwork

Orioles tickets use the 24 approved Baltimore art concepts. Each game's concept is chosen when the ticket is issued and never changes. Opening Day goes on each season opener, July 4th Fireworks on July 4 games, Rivalry Series on the Yankees games, and Giveaway Day on giveaway nights. Every other game gets one of the remaining concepts, picked the same way each time.

The images in `public/art/orioles/` are cut from the approved concept sheet, so they are low resolution (about 185×113 px each). To swap in final artwork, replace a file with the same name, or add a new entry to `ORIOLES_ART`. Concept 24, Last Home Game, isn't included yet because the supplied sheet has a screen overlay across it. Other teams still use the generated posters in `TicketArt.tsx`.

## Demo controls

A small dashed **DEMO** tab on the right edge (or press **D**) opens reviewer tools. They're kept separate from the consumer UI.

- **A** Baltimore vs Boston (Section 330 · Row 9 · Seat 14, 8,315 joined)
- **B** Standing Room Only
- **C** Multiple eligible teams/games
- **D** Completed game
- **E** Milestone game (end it to add the 50-game, streak and giveaway marks)
- **F** Established fan Passport (6 teams, 5 leagues, 2 seasons, 37 games)
- Game state controls (Start / Game final / + Historic mark), fan location (at / beyond the venue), and **Restart demo**

State persists in `localStorage`, so a reload keeps tickets and seats.

## Storyboard acceptance

```bash
npm run build && npx vite preview --port 4173 &
npm run shots
```

`scripts/acceptance-shots.mjs` drives the real app at 390×844 with simulated safe areas. It captures every storyboard screen, and captures the launch and print sequences frame by frame using a frozen clock and scrubbed CSS animations. `scripts/compare-sheets.mjs` then places each render beside its storyboard crop in `acceptance/compare/`.
