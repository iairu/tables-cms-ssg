
<img src="src/assets/tables-logo.svg" alt="Tables CMS Logo" />

# TABLES CMS Architecture

## Overview

TABLES is a dual-site system consisting of:
1. **CMS Site** (Port 8000) - Admin interface for content management
2. **Main Site** (Port 3000) - Public-facing SSG site generated from CMS data

## System Architecture


```

┌─────────────────────────────────────────────────────────────────┐
│                         TABLES CMS                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────┐        ┌──────────────────────────┐  │
│  │   CMS Site            │        │   Main Site              │  │
│  │   (Port 8000)         │        │   (Port 3000)            │  │
│  │                       │        │                          │  │
│  │  - Gatsby Develop     │        │  - Gatsby Build Output   │  │
│  │  - React Components   │        │  - Static HTML/JS/CSS    │  │
│  │  - localStorage       │        │  - Served by Vercel      │  │
│  │  - CMS Interface      │        │  - Public Pages          │  │
│  └───────────┬───────────┘        └──────────▲───────────────┘  │
│              │                               │                  │
│              │  Save Action                  │                  │
│              │  (3 sec delay)                │                  │
│              │                               │                  │
│              ▼                               │                  │
│  ┌───────────────────────────────────────────┴────────────────┐ │
│  │            CMS Site /api/build Endpoint                    │ │
│  │                                                            │ │
│  │  1. Receive localStorage data from CMS                     │ │
│  │  2. Export to main-site/src/data/*.json                    │ │
│  │  3. Run gatsby build in main-site/                         │ │
│  │  4. Copy built site to root public/                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

```

## Directory Structure


```

TABLES/
├── src/                          # CMS Site Source
│   ├── api/
│   │   └── build.js             # Build API endpoint
│   ├── assets/
│   │   └── tables-logo.svg      # Project Logo
│   ├── components/
│   │   └── SideMenu.js          # CMS navigation
│   ├── hooks/
│   │   └── useCMSData.js        # localStorage management + build trigger
│   ├── pages/
│   │   ├── index.js             # CMS home (shows site title from settings)
│   │   ├── cms.js               # Main CMS interface
│   │   └── 404.js
│   └── styles/
│       └── cms.css
│
├── main-site/                    # Main Public Site Source
│   ├── src/
│   │   ├── templates/
│   │   │   ├── page.js          # Page template
│   │   │   ├── blog-article.js  # Blog article template
│   │   │   └── blog-index.js    # Blog listing template
│   │   └── components/
│   ├── static/
│   │   ├── data/                # JSON data exported from CMS
│   │   │   ├── pages.json       # Page content + components
│   │   │   ├── blog.json        # Blog articles
│   │   │   ├── cats.json        # Cat data
│   │   │   └── settings.json    # Site settings
│   ├── gatsby-config.js
│   ├── gatsby-node.js           # Creates pages from JSON data
│   └── package.json
│
├── public/                       # Served by Express on port 80
│   └── (copied from main-site/public/ after build)
│
├── package.json                  # CMS site dependencies
├── gatsby-config.js
├── gatsby-node.js
└── .cms-data.json               # Persistent storage (not in git)

```

## Data Flow

### 1. Content Creation (CMS Site)


```

User edits content in CMS
↓
Content saved to localStorage
↓
useCMSData hook detects change
↓
scheduleBuild() triggered
↓
Wait 3 seconds (debounce)
↓
triggerBuild() called

```

### 2. Build Process


```

POST /api/build
↓
Collect all localStorage data
↓
Export to main-site/src/data/*.json
↓
Save to .cms-data.json (backup)
↓
cd main-site && npm run build
↓
Copy main-site/public → root/public
↓
Express serves updated site

```

### 3. Page Generation (Main Site)


```

gatsby-node.js reads JSON files
↓
sourceNodes() creates GraphQL nodes
↓
createPages() generates routes
↓
Templates render with data
↓
Static HTML files created

```

## Key Features

### New Page Configuration Features

Each page in the CMS now includes advanced configuration options:

1. **Navigation Dropdown**
   - Control where pages appear in navigation
   - Options: None (default), Header, Footer
   - Allows separate header and footer menu management

2. **Theme Version Toggle**
   - Choose theme variant for the page
   - Options: Auto, Light, Dark
   - Adds corresponding class to body element (`theme-auto-ver`, `theme-light-ver`, `theme-dark-ver`)

3. **Enforced Theme**
   - Override global theme setting for specific pages
   - Options: Use global (default), Light, Dark, Auto
   - Useful for landing pages or special sections

4. **Site Meta Description**
   - Multi-language SEO description support
   - Improves search engine visibility
   - Localized per language

5. **Button and Link Color**
   - Page-wide color customization
   - Visual color picker + hex input
   - Applied via CSS variable `--page-button-color`

6. **Sitemap Priority**
   - Control page importance in sitemap.xml
   - Range: 0.0 to 1.0 (default: 0.5)
   - Used for SEO optimization

### CMS Site Features

1. **Page Management**
   - Create/edit/delete pages
   - Component-based page builder
   - Support for: Slide, Reviews, Text, Gallery components
   - Slug-based routing

2. **Blog Management**
   - Create/edit/delete articles
   - Chronological organization (year/month)
   - Author attribution
   - Save spinner during edits

3. **Component Editor**
   - Add/remove components
   - Switch component types
   - Rich field editing
   - Nested data (e.g., Reviews with multiple review items)

4. **Settings**
   - Site Title (displayed on homepage)
   - Default Language
   - Theme selection

5. **Additional Sections**
   - Cats data management
   - Component library
   - ACL (Access Control List)
   - Extensions management
   - Display-If rules

### Build System Features

1. **Auto-Build Trigger**
   - 3-second debounce after save
   - Build queue management
   - Status indicators (building/saved)

2. **Data Export**
   - localStorage → JSON files
   - Persistent backup storage
   - Type-safe data structure

3. **SSG Build**
   - Gatsby static site generation
   - GraphQL data layer
   - Dynamic route creation
   - Template-based rendering

4. **Build Status Indicators**
   - Spinner during build
   - Success notification
   - Real-time status updates

## Component Types

### Slide Component
```json
{
  "component": "Slide",
  "fields": {
    "Slide heading": "string",
    "Slide content": "string"
  }
}

```

### Reviews Component

```json
{
  "component": "Reviews",
  "fields": {
    "reviews": [
      {
        "Review logo": "string (URL)",
        "Review content": "string",
        "Review author": "string"
      }
    ]
  }
}

```

### Text Component

```json
{
  "component": "Text",
  "fields": {
    "content": "string"
  }
}

```

### Gallery Component

```json
{
  "component": "Gallery",
  "fields": {
    "images": ["string (URL)"]
  }
}

```

## Development Workflow

### Setup

1. **Install CMS dependencies**
```bash
cd TABLES
npm install

```


2. **Install Main Site dependencies**
```bash
cd main-site
npm install
cd ..

```



### Development Mode

1. **Start CMS (port 8000)**
```bash
npm run develop

```


* Access at: http://localhost:8000
* Hot reload enabled
* Edit content in CMS interface


2. **Start Main Site (port 3000)**
```bash
cd main-site
npm run develop

```


* Access at: http://localhost:3000
* Runs on custom port 3000 (configured in `main-site/package.json`)


3. **Build Main Site**
* Automatically triggered 3 seconds after saving in CMS
* Or manually: `cd main-site && npm run build`



### Build Scripts

**CMS Site (`package.json`):**

* `npm run develop`: Start development server (Port 8000)
* `npm run build`: Build the CMS site for production
* `npm run serve`: Serve the built CMS site locally
* `npm run clean`: Clean Gatsby cache

**Main Site (`main-site/package.json`):**

* `npm run develop`: Start development server (Port 3000)
* `npm run build`: Build the public site
* `npm run serve`: Serve the built public site
* `npm run clean`: Clean Gatsby cache

## API Endpoints

### POST /api/build

Triggers a build of the main site from CMS data.

**Request:**

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "trigger": "cms-save",
  "data": {
    "pages": [...],
    "blogArticles": [...],
    "catRows": [...],
    "settings": {...},
    "acl": {...},
    "extensions": {...}
  }
}

```

**Response:**

```json
{
  "status": "building",
  "message": "Build started - exporting data and building main site",
  "timestamp": "2024-01-15T10:30:00.000Z"
}

```

### GET /api/build

Returns current build status.

**Response:**

```json
{
  "isBuildInProgress": false,
  "lastBuildTime": "2024-01-15T10:30:00.000Z",
  "queueLength": 0,
  "mode": "development"
}

```

## Storage

### localStorage (Browser)

* Primary data store during CMS session
* Keys: `pages`, `blogArticles`, `catRows`, `componentRows`, `settings`, `acl`, `extensions`
* Automatically synced on every change

### .cms-data.json (Server)

* Persistent backup of all CMS data
* Written during build process
* Used if localStorage data not provided

### main-site/src/data/*.json (Build Input)

* Exported before each build
* Read by gatsby-node.js
* Source of truth for static site generation

## Sitemap Generation

The system automatically generates a `sitemap.xml` file during production builds:

* **Location**: `main-site/static/sitemap.xml`
* **Includes**: All pages and blog articles across all languages
* **Priority Support**: Uses `sitemapPriority` field from page configuration
* **Updated**: Automatically regenerated on each build
* **Format**: Standard XML sitemap protocol

Example sitemap entry:

```xml
<url>
  <loc>[https://example.com/en/about](https://example.com/en/about)</loc>
  <lastmod>2024-01-15</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>

```

## Technology Stack

### CMS Site

* **Framework:** Gatsby 5.12+
* **Language:** JavaScript / TypeScript
* **UI:** React 18.2+
* **State Management:** React Hooks + localStorage
* **Styling:** CSS + inline styles
* **Build Tool:** Webpack (via Gatsby)

### Main Site

* **Framework:** Gatsby 5.12+
* **Language:** JavaScript / TypeScript
* **Templating:** React 18.2+
* **Data Layer:** GraphQL
* **Routing:** Gatsby Router
* **Build Output:** Static HTML/CSS/JS

### Server

* **Runtime:** Node.js
* **Framework:** Express.js
* **Static Serving:** express.static
* **Build Execution:** child_process.exec

## Performance Considerations

1. **Debounced Builds**
* 3-second delay prevents excessive builds
* Queue management for concurrent save requests


2. **Build Optimization**
* Only rebuild when data changes
* Copy operation for faster deployment


3. **Static Site Benefits**
* No database queries at runtime
* CDN-ready output
* Fast page loads



## Security Notes

1. **CMS Access**
* Currently no authentication
* Should add auth layer for production
* Consider ACL implementation


2. **Build API**
* CORS enabled for development
* Should restrict in production
* Rate limiting recommended


3. **Data Validation**
* Add JSON schema validation
* Sanitize user inputs
* Validate file paths



## Troubleshooting

### Build not triggering

* Check browser console for API errors
* Verify `/api/build` endpoint is accessible
* Check `main-site` directory exists

### Main site not updating

* Verify build completed successfully
* Check `main-site/public` directory exists
* Ensure files copied to root `public/`

### Data not persisting

* Check localStorage is enabled in browser
* Verify `.cms-data.json` is being written
* Check file permissions

### Port conflicts

* CMS on 8000: Default Gatsby port.
* Main site on 3000: Checked in `main-site/package.json`.

## Future Enhancements

1. **Authentication & Authorization**
* User login system
* Role-based access control
* Session management


2. **Media Management**
* File upload system
* Image optimization
* Asset library


3. **Version Control**
* Content versioning
* Rollback capability
* Change history


4. **Preview Mode**
* Live preview before publish
* Draft/published states
* Scheduled publishing


5. **Multi-language Support**
* i18n implementation
* Language switcher
* Translated content management


6. **Advanced Components**
* Form builder
* Navigation menus
* SEO metadata editor


7. **Deployment Integration**
* Webhook support
* CI/CD integration
* Cloud hosting options

