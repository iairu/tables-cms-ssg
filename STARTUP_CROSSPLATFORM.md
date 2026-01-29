# TABLES CMS: Fast Startup + Cross-Platform Electron Build
## Problem Statement
**Current startup time**: 30-60+ seconds due to `gatsby develop` running webpack compilation with HMR on every launch.
**Goal**: Sub-5-second startup while maintaining all CMS functionality (including API endpoints).
## Current Architecture
* Electron app runs `gatsby develop` on startup
* CMS uses Gatsby Functions (`src/api/*.js`) for build triggers, file uploads
* `gatsby develop` provides both static pages AND the API server
* `gatsby serve` does NOT support Gatsby Functions
## Proposed Solution: Express + Pre-built Static Files
### Approach
Replace `gatsby develop` with:
1. **Pre-built static CMS files** (generated during `npm install` or first run)
2. **Lightweight Express server** that serves:
    * Static files from `cms-site/public/`
    * API endpoints (extracted from Gatsby Functions)
### Why This Works
* Express server starts in ~100ms vs 30-60s for Gatsby
* Static files load instantly (no webpack compilation)
* API endpoints preserved via Express routes
* CMS editing still works (localStorage-based, client-side)
* Build/deploy functionality intact
## Implementation Plan
### Phase 1: Extract API to Express Server
Create `cms-site/server.js`:
* Import existing API handlers from `src/api/*.js`
* Mount as Express routes (`/api/build`, `/api/upload`, etc.)
* Serve static files from `public/` directory
* Handle SPA routing (fallback to index.html)
### Phase 2: Modify Gatsby Build Process
Update `cms-site/package.json`:
* Add `prebuild` script to ensure clean state
* Keep existing `gatsby build` for production builds
* Add `serve` script to run Express server
### Phase 3: Update Electron Main Process
Modify `electron-main.js`:
* Replace `gatsby develop` spawn with Express server spawn
* On first run (no `public/` folder), run `gatsby build` once
* Subsequent launches skip build, just start Express (~2-3s total)
### Phase 4: Electron-Builder Configuration
Create `electron-builder.yml` at project root:
* Configure for macOS, Windows, Linux builds
* Include pre-built `cms-site/public/` in package
* Include `main-site/` for deployment functionality
* Exclude `node_modules/.cache`, `.git`, etc.
## File Changes Summary
### New Files
* `cms-site/server.js` - Express server with API routes
* `electron-builder.yml` - Cross-platform build config
### Modified Files
* `electron-main.js` - Use Express instead of Gatsby develop
* `cms-site/package.json` - Add serve script
* `package.json` (root) - Add electron-builder scripts
## Startup Time Comparison
| Scenario | Current | After |
|----------|---------|-------|
| First run (no build) | 60-90s | 60-90s (one-time) |
| Subsequent runs | 30-60s | 2-5s |
| After code changes | 30-60s | 30-60s (rebuild needed) |
## Risks & Mitigations
1. **API compatibility**: Test all endpoints thoroughly after extraction
2. **Hot reload loss**: Accept this trade-off; users can manually refresh
3. **Build caching**: Keep `.cache` for faster rebuilds when needed
