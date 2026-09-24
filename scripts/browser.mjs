// Chromium for the acceptance scripts: $CHROME, else this cloud environment's preinstalled build,
// else Playwright's own download (CI runs `npx playwright-core install chromium`).
import { existsSync } from 'node:fs';

const PREINSTALLED = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

export const executablePath = process.env.CHROME ?? (existsSync(PREINSTALLED) ? PREINSTALLED : undefined);
