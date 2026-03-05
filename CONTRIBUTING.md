<div align="center">
  <h1>─── ✧ Contributing to Lune ✧ ───</h1>
  <p>Lune is open-source and built in the open. Every contribution — whether it's a bug fix,
  a feature, or just a well-written issue — moves it forward.</p>
</div>

---

### / Before You Begin

Read the [Code of Conduct](CODE_OF_CONDUCT.md). It is short and it applies to everyone,
including maintainers.

For large changes, open an issue first and describe what you want to build. It avoids
wasted effort on both sides.

---

### / Prerequisites

| Requirement | Minimum Version                  |
| ----------- | -------------------------------- |
| Node.js     | 20 LTS                           |
| npm         | 10+                              |
| Git         | 2.40+                            |
| OS          | Windows 10+, macOS 12+, or Linux |

Familiarity expected:

- **TypeScript** — the entire codebase is strictly typed
- **React 18** — components, hooks, and state patterns
- **Electron 30** — main/renderer process separation, IPC
- **Vite 5** — build pipeline and plugin system

---

### / Setting Up Locally

**1. Fork and clone**

```bash
git clone https://github.com/your-fork/Lune.git
cd Lune
```

**2. Install dependencies**

```bash
npm install
```

This runs `postinstall` automatically, which rebuilds native binaries
(`better-sqlite3`, `bufferutil`) for your local Electron version.

**3. Environment variables**

Create a `.env` file at the project root. Refer to `.env.example` (if present)
for the keys required. At minimum you will need your Spotify client credentials.

**4. Start the development server**

```bash
npm run dev
```

This boots the Vite renderer and the Electron main process in watch mode simultaneously.

---

### / Build Commands

| Command           | Output     | Purpose                                      |
| ----------------- | ---------- | -------------------------------------------- |
| `npm run dev`     | —          | Development server with hot reload           |
| `npm run build`   | `release/` | Production installer                         |
| `npm run lint`    | —          | ESLint across all `.ts` and `.tsx`           |
| `npm run preview` | —          | Preview the renderer bundle without Electron |

---

### / Architecture at a Glance

Lune separates concerns across two process boundaries:

- **Renderer** (`src/`) — React 18 + TypeScript UI. All visual logic, state, and
  routing lives here. Communicates with the main process exclusively via IPC.

- **Main process** (`electron/`) — Node.js environment. Handles file system access,
  yt-dlp stream harvesting, SQLite persistence, Discord RPC, and system-level APIs.

- **Database** — Better-SQLite3 manages the local library. All schema changes must be
  backward-compatible or include a migration.

- **Styling** — Vanilla CSS only. No Tailwind, no styled-components. Follow the existing
  HSL-based token system for colors and spacing.

---

### / Commit Format

Lune uses conventional commit prefixes. Keep messages lowercase and to the point.

| Prefix      | When to use                                           |
| ----------- | ----------------------------------------------------- |
| `feat:`     | A new feature or user-facing behaviour                |
| `fix:`      | A bug fix                                             |
| `chore:`    | Tooling, dependencies, config — nothing the user sees |
| `refactor:` | Code restructure without behaviour change             |
| `style:`    | CSS or visual-only changes                            |
| `docs:`     | README, CONTRIBUTING, or inline documentation         |

Examples:

```
feat: add repeat-one mode to the playback queue
fix: resolve crash when library path contains spaces
chore: update electron-builder to 24.13.3
```

---

### / Branch Naming

Branches should be lowercase with hyphens and prefixed by type:

```
feature/lyrics-scroll-speed-setting
fix/queue-skip-on-empty-playlist
chore/bump-vite-5
docs/update-contributing-guide
```

Delete your branch after it is merged. Keep the branch scope narrow — one concern per PR.

---

### / Before Opening a Pull Request

- Run `npm run lint` and resolve every warning — the lint gate is set to zero warnings
- Test your change with `npm run dev` end-to-end
- Keep commits scoped using the format above
- Reference the related issue number in your PR description

PRs that touch the audio pipeline, IPC layer, or database schema will require
additional review time. Flag these clearly in the PR description.

---

### / Out of Scope

To keep the review queue focused, the following will not be accepted:

- Replacing Vanilla CSS with Tailwind, styled-components, or any CSS-in-JS solution
- Switching the build tool away from Vite or the runtime away from Electron
- Adding a third-party UI component library (e.g. MUI, Chakra, shadcn)
- Features that require users to hold a Spotify Premium subscription
- Anything that breaks backward compatibility with existing local library databases without a migration path

If you are unsure whether your idea fits, open a Discussion or ask on [Discord](https://discord.gg/TardrVJT9N) before writing any code.

---

### / Reporting Bugs

Open a GitHub Issue or drop into the [Discord server](https://discord.gg/TardrVJT9N) with:

1. Steps to reproduce
2. What you expected vs. what happened
3. OS, Node version, and Lune version
4. Logs from the DevTools console or Electron main process if available

For quick questions or casual discussion, Discord is the faster route.
GitHub Issues are preferred for anything that needs to be tracked or reproduced.

---

<div align="center">
  <sub>✦ Lune — Crafted for the Aesthetic Listener ✦</sub>
</div>
