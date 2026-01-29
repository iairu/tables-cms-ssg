# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

TABLES CMS is an offline-first macOS Electron application that combines a CMS interface (`cms-site`) with a Gatsby static site generator (`main-site`). The application uses file-based JSON storage and deploys to Vercel.

**Key Architecture:**
- **Electron Wrapper**: Provides native macOS app experience with IPC for file operations
- **CMS Site (cms-site)**: React/Gatsby admin interface for content management
- **Main Site (main-site)**: Gatsby SSG that consumes JSON data from CMS to generate static sites
- **Data Flow**: CMS → localStorage → JSON export → Gatsby build → Vercel deployment

## Working Directory Context

The main application code resides within a macOS Application Bundle structure:

```
TABLES.app/Contents/Resources/  # This is the working directory for most operations
├── cms-site/                   # Admin interface
├── main-site/                  # Public site generator
├── electron-main.js            # Electron main process
├── electron-preload.js         # IPC bridge
└── start.sh                    # Application launcher
```

Always navigate to `TABLES.app/Contents/Resources/` before running npm commands or working with the codebase.

## Essential Commands

### Starting the Application

**Run the full Electron app (recommended for testing):**
```bash
cd TABLES.app/Contents/Resources
npm start
```

**Run CMS interface in browser (development):**
```bash
cd TABLES.app/Contents/Resources/cms-site
npm install
npm run develop
# Access at http://localhost:8000
```

**Run main site in browser (development):**
```bash
cd TABLES.app/Contents/Resources/main-site
npm install
npm run develop
# Access at http://localhost:3000
```

### Building and Cleaning

**Clean Gatsby cache (cms-site):**
```bash
cd TABLES.app/Contents/Resources/cms-site
npm run clean
```

**Clean and build main-site:**
```bash
cd TABLES.app/Contents/Resources/main-site
npm run clean
npm run build
```

**Production build of main-site:**
```bash
cd TABLES.app/Contents/Resources/main-site
gatsby clean && gatsby build
```

### Installing Dependencies

Always use `--legacy-peer-deps` due to React version overrides:
```bash
npm install --legacy-peer-deps --no-audit --no-fund
```

## Data Architecture

### Storage Mechanism
- **Development/CMS**: Data stored in browser `localStorage` (accessed via `useCMSData` hook)
- **Production**: Data exported to JSON files in `main-site/static/data/`
- **Assets**: Base64 encoded for CMS preview, converted to real files during Gatsby build

### Data Flow
1. User edits content in CMS interface
2. Changes saved to `localStorage` via `useCMSData` hook
3. On "Deploy" click, data is:
   - Serialized to JSON
   - Posted to `/api/build` endpoint
   - Written to `main-site/static/data/*.json`
   - Assets copied from `cms-site/static/uploads/` to `main-site/static/uploads/`
4. Gatsby builds static site from JSON files
5. (Optional) Deployed to Vercel via API

### Key Data Files
- `pages.json` - Page configurations with component arrays
- `settings.json` - Site settings, languages, theme, Vercel config
- `blogArticles.json` - Blog posts
- `catRows.json` - Pedigree extension data
- `inventory.json` - Rental inventory
- `reservations.json` - Rental reservations
- `movieList.json` - Movie tracker entries

### State Management Hook
The `useCMSData` hook (in `cms-site/src/hooks/useCMSData.js`) is the central state manager:
- Syncs with `localStorage`
- Provides `triggerBuild()` function for deployment
- Polls build status via `/api/build` GET endpoint
- Handles cooldown periods (5s local, 120s deploy)

## Extension System

Extensions are modular database-like features in `cms-site/src/pages/cms/[extension_name]/`:

**Current Extensions:**
- `pedigree` - Cat lineage database
- `attendance`, `customers`, `employees`, `inventory`, `reservations`, `calendar` - Rental management suite
- `movietracker` - IMDB-based tracking
- `personal` - User preferences (demo only, no encryption)
- `blog` - Blogging engine
- `uploads` - Asset management

**Adding a New Extension:**
1. Create directory in `cms-site/src/pages/cms/[name]/`
2. Add `index.js` (table view) and `edit.js` (form) pages
3. Register data schema in `useCMSData` hook
4. Add to `localStorage` serialization in build trigger
5. Export to JSON in `api/build.js`
6. Optionally consume in main-site templates

## Component-Based Page Builder

The main-site renders pages as dynamic component arrays.

**Data Structure:**
```json
{
  "slug": "home",
  "rows": [
    { "type": "TitleSlide", "content": {...} },
    { "type": "Boxes", "content": {...} },
    { "type": "Reviews", "content": {...} }
  ]
}
```

**Available Components:**
Located in `main-site/src/components/page/`:
- `TitleSlide` - Hero section with background media
- `Boxes` - Grid layout for features
- `Infobar` - Alert bar
- `Flies` - Animated floating elements
- `Slide` - Standard content block
- `Video` - Video embed
- `Ranking` - Comparison tables
- `References`/`Reviews` - Testimonials
- `Slideshow` - Image carousel (uses react-slick)

**Rendering Logic:**
`main-site/src/templates/page.js` iterates through `rows` array and dynamically imports matching components.

## Build & Deployment Pipeline

**Build Trigger:**
1. User clicks "Deploy" button in CMS header
2. Frontend calls `manualTriggerBuild(localOnly)` from `useCMSData`
3. Data serialized from `localStorage`
4. POST to `/api/build` with CMS data and Vercel credentials

**Build Process (in `cms-site/src/api/build.js`):**
1. Write JSON files to `main-site/static/data/`
2. Copy uploads to `main-site/static/uploads/`
3. Run `gatsby clean && gatsby build` in main-site
4. If not `localOnly`, deploy to Vercel via CLI or API

**Build Status:**
- Global flags: `global.isBuildInProgress`, `global.lastBuildTime`
- Frontend polls `/api/build` (GET) every 3s during builds
- Cooldown prevents rapid rebuilds

**Binary Resolution:**
The build API searches for Node/npm binaries in:
1. `support-bin/npm_source/bin/` (bundled)
2. System PATH (fallback)

## IPC Communication

Electron uses context bridging for secure IPC (see `electron-preload.js`):

**Exposed APIs:**
- `window.electron.onConsoleOutput(callback)` - Receive console logs
- `window.electron.runCommand(command)` - Execute shell commands
- `window.electron.closeApp()` - Quit application

**Main Process Handles:**
- File I/O operations
- Spawning Gatsby dev servers
- Build process management

## Theme System

Themes are applied via body class `theme-[themeName]` and CSS variables.

**Current Theme Support:**
- Default (existing styles)
- Per-page theme version: `theme-auto-ver`, `theme-light-ver`, `theme-dark-ver`
- Per-page button color: `--page-button-color` CSS variable

**Planned Themes (see PLANNED.md):**
Synthwave, Matrix, Monokai, GitHub, VSCode, Anime, Historic Paper, Senior Citizen, ayu

**Adding a Theme:**
1. Create CSS file in `main-site/src/styles/theme-[name].css`
2. Define CSS variables and body class selectors
3. Register in CMS Settings page for user selection

## Important Notes

### Security Warnings
- User database extensions (Biometric, Medical, Financial, Legal) are **demos only**
- No encryption on JSON storage
- No role-based access control
- Never use for real PII or sensitive data

### Version Control
- Use git commands with `--no-pager` flag
- Include co-author line in commits: `Co-Authored-By: Warp <agent@warp.dev>`

### Electron Packaging
- ASAR is disabled in package.json
- Allows direct writes to app folder
- Enables in-place updates and data storage

### Common Pitfalls
- Always run `npm install --legacy-peer-deps` due to React overrides
- Clear `.cache` directory if Gatsby behaves unexpectedly
- Build failures may be due to missing binaries in `support-bin/`
- IPC communication requires context bridging - never use `nodeIntegration: true`

## Testing

No formal test framework is currently configured. To verify changes:
1. Run cms-site in development mode
2. Make changes and save
3. Trigger local build
4. Check main-site output in `main-site/public/`
5. Optionally test with `gatsby serve` in main-site

## Multilingual Support

The application supports multiple languages:
- Languages configured in Settings
- Page content stored in `translations` object per language code
- Language switching via localStorage `currentlang` key
- Utility function `t(key, lang)` in `main-site/src/utils/localization.js`
