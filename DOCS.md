
# Technical Documentation

## Architecture Overview

TABLES CMS operates as a hybrid application. It uses Electron to wrap a local React application (`cms-site`) which acts as the administrative interface. This interface manipulates local JSON data, which is then consumed by a separate Gatsby project (`main-site`) to generate the final static website.

### Directory Structure

The codebase follows a macOS Application Bundle structure. The core logic resides within `TABLES.app/Contents/Resources`.

```text
TABLES.app/Contents/Resources/
├── cms-site/              # The Administrative Interface (Electron Renderer)
│   ├── src/
│   │   ├── api/           # Node.js scripts for file I/O (save, load, upload)
│   │   ├── components/    # CMS UI Components (Editors, Modals)
│   │   ├── pages/         # CMS Routes (Blog, Settings, Extensions)
│   │   └── hooks/         # Data management hooks (useCMSData)
│   └── package.json
│
├── main-site/             # The Public Website Generator (Gatsby)
│   ├── src/
│   │   ├── components/    # Frontend Display Components (Slide, Flies, Ranking)
│   │   ├── templates/     # Gatsby Page Templates
│   │   ├── styles/        # CSS Themes
│   │   └── utils/         # Localization and Context providers
│   └── package.json
│
├── electron-main.js       # Electron Main Process entry point
├── electron-preload.js    # Context Bridge for IPC communication
└── start.sh               # Launch script
```

## Core Concepts

### 1. Data Persistence

The application does not use a traditional SQL database. Instead, it relies on a file-based system:

* **JSON Storage:** Data is serialized into JSON files allowing for easy "Save As" / "Open" functionality similar to desktop productivity software.
* **Assets:**
* **Development:** Images and files are converted to Base64 strings for immediate preview within the Electron app.
* **Production:** During the build process, assets are materialized as real files to ensure performance on Vercel.

### 2. The Extension System

Extensions are modular additions to the CMS located in `cms-site/src/pages/cms/[extension_name]`.
Each extension typically consists of:

* **Index Page:** The data table view.
* **Edit Page:** The form interface for creating/updating entries.
* **Configuration:** Entries in the global state management to handle the specific data schema.

Current Schema Examples:

* **Pedigree:** Stores strictly structured data for Sire/Dam relationships.
* **Rental:** Relational data linking Inventory IDs to Reservation dates and Customer profiles.

### 3. The Page Builder (Funnels)

The "main-site" utilizes a component-based architecture. The CMS stores an array of component objects for every page.

* **Data Structure:** `[{ type: "TitleSlide", content: {...} }, { type: "Reviews", content: {...} }]`
* **Rendering:** `main-site/src/templates/page.js` iterates through this array and dynamically imports the matching React component.

**Available Components:**

* `TitleSlide`: Hero section with background media.
* `Boxes`: Grid layout for features or services.
* `Infobar`: High-visibility alerts or stats.
* `Flies`: Animated floating elements.
* `Slide`: Standard content block.
* `Video`: Embeddable video player.
* `Ranking`: Comparison tables.
* `References/Reviews`: Social proof elements.
* `Slideshow`: Carousel component.

## Deployment Pipeline

1. **Trigger:** User clicks "Deploy" in the CMS header.
2. **Build:** The application bundles the current JSON state and the `main-site` template.
3. **Push:** The bundle is pushed to the configured Vercel project context.
4. **Static Generation:** Vercel runs `gatsby build`, generating static HTML/CSS/JS.

## Security Notes

### User Database Extensions

The modules labeled "Biometric", "Medical", "Financial", "Legal", and "Personal" are **prototypes**.

* **No Encryption:** Data entered here is stored in plain text JSON.
* **No Access Control:** There is currently no role-based access control (RBAC) implemented for these specific fields.
* **Usage:** These should strictly be used for UI/UX demonstration or development of the extension API, never for real PII (Personally Identifiable Information).

## Development Guidelines

### Adding a New Theme

1. Create a new CSS file in `main-site/src/styles/` (e.g., `theme-matrix.css`).
2. Define the CSS variables and body classes.
3. Register the theme in the CMS Settings page to allow user selection.

### Working with Electron

* **IPC Communication:** Use `electron-preload.js` to expose Node.js filesystem capabilities to the React renderer safely.
* **File Access:** All file write operations should go through the `cms-site/src/api` layer to ensure consistency.
