# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An Appwrite serverless Function (Node.js runtime). The single entrypoint (`src/main.js`) is invoked per-request by the Appwrite platform, not run as a long-lived server. Despite the repo name, the code is currently unmodified Appwrite starter boilerplate — a "Pong" ping route and a JSON "Learn More" route — with no Panchang/festival-notification logic implemented yet.

## Commands

- `npm install` — install dependencies (also the configured Appwrite build command).
- `npm run format` — format the codebase with Prettier (`prettier --write .`).

There are no lint or test scripts configured, and no local dev-server command; the function runs inside Appwrite's runtime when deployed/executed there.

## Architecture

- `src/main.js` default-exports the async handler `({ req, res, log, error }) => {}` that Appwrite calls on every invocation.
  - `req` — incoming request data; routing is done manually via `req.path` (e.g. the `/ping` check) rather than a router library.
  - `res` — response builder: `res.text()`, `res.json()`, `res.binary()`. Always return a `res.*()` call — an unhandled path falls through to the final `res.json()`.
  - `log` / `error` — write to the Appwrite Console function logs; not visible to end users.
  - Function-scoped Appwrite credentials arrive via env vars set by the platform at invocation time: `APPWRITE_FUNCTION_API_ENDPOINT`, `APPWRITE_FUNCTION_PROJECT_ID`, and the per-request API key at `req.headers['x-appwrite-key']`. Use these (not hardcoded config) to construct the `node-appwrite` `Client`.
- Runtime config (Node 18.0, entrypoint, permissions, timeout) is set in the Appwrite Console/CLI, not in this repo — see the table in README.md if it needs to be reproduced.
- Module type is ESM (`"type": "module"` in package.json) — use `import`/`export`, not `require`.
