
# TABLES Content Management System

with SSG (Static Site Generator) deployment to Vercel.

[![Build Status](https://travis-ci.org/iairu/tables-cms-ssg.svg?branch=master)](https://travis-ci.org/iairu/tables-cms-ssg)
[![Security](https://img.shields.io/badge/security-verified-blue)](https://github.com/iairu/tables-cms-ssg/security/policy)
[![License](https://img.shields.io/badge/license-GNUAGPLv3-blue)](https://github.com/iairu/tables-cms-ssg/blob/master/LICENSE)

<img src="TABLES.app/Contents/Resources/static/assets/tables-feature-highlight-banner.png" alt="Tables CMS Feature Highlight and Logo" />

TABLES CMS is an offline-first, macOS-native Content Management System built on Electron and Gatsby. It is designed to bridge the gap between desktop-based content editing and modern static site generation.

The application functions as a local environment for managing structured data, creating dynamic landing pages, and handling complex extensions (such as Rental management or Pedigree tracking), with seamless deployment capabilities to Vercel.

## Key Features

### Core Functionality
* **Offline-First Architecture:** Run the CMS entirely locally on macOS.
* **Project Switching:** Switch between different projects seamlessly using local JSON file-based storage.
* **Static Site Generation:** Built on Gatsby, ensuring high performance, SEO, and security for the deployed sites.
* **Vercel Deployment:** Integrated one-click deployment pipeline to Vercel.
* **Asset Management:** Drag-and-drop asset manager that handles conversion to base64 for local preview and real file handling during deployment.

### Content Management
* **Dynamic Page Builder:** Create custom funnels and pages using a suite of modular components (Title Slide, Boxes, Infobar, Video, Ranking, Reviews, etc.).
* **Blogging Engine:** Complete blog support with authors, dates, rich text, and multilingual capabilities.
* **History & Versioning:** Save snapshots of content with capabilities to label, download, upload, rollback, or delete specific history states.

### Extensions & Business Logic
TABLES CMS includes specialized modules for specific industry needs:
* **Pedigree:** A database for managing cat lineages, breeds, and owner information.
* **Rental Management:** A comprehensive solution for rental businesses, including inventory tracking, reservations, employee management, and calendar views.

## Getting Started

### Prerequisites
* macOS (Optional as application is structured as a `.app` bundle)
* Node.js and npm (bundled within the resources, but required for development)

### Download the latest release from [GitHub Releases](https://github.com/iairu/TABLES/releases)

### Running from Source
The codebase is currently structured within the macOS Application bundle format.

1.  Navigate to the resources folder and start the Electron application:
    ```bash
    cd TABLES.app/Contents/Resources
    npm install
    npm start # or you can follow the instructions below for a browser setup
    ```
2.  Optional: Install dependencies for the CMS interface, then run in browser:
    ```bash
    cd cms-site
    npm install
    npm run develop
    ```
3.  Optional: Install dependencies for the Site Generator, optionally run it for localhost deployment from cms-site:
    ```bash
    cd ../main-site
    npm install
    npm run develop
    ```

## Roadmap

We are actively working on the following features and improvements:

### Core & UI
* **Page Groups:** Implementation of "Direct Pages" and custom grouping for improved navigation structure (dropdown interactions).
* **UI Persistence:** State preservation for the deploy button across navigation changes.
* **UX Improvements:** Multi-column layouts for the component editor and mobile responsiveness updates.
* **Theming Engine:** Integrated theme picker supporting presets like Synthwave, Matrix, Monokai, GitHub, VSCode, and Historic Paper.

### Extensions
* **Extension Grouping:** Better organization for User Database extensions.
* **Enhanced Pedigree:** Color-coded lineage trees (Blue/Pink), expanded generation links, and genetic analysis features.
* **Movie & Show Tracker:** Integration with IMDB numbering.
* **Notes:** A dedicated notes extension.
* **E-commerce:** Planned integration with external providers (e.g., Snipcart).

### Collaboration
* **Real-time Server:** A WebSocket-based public server to enable "Currently edited by..." notifications and basic collaboration across networks (requires GDPR consent).

### Demo Databases (Non-Secure)
> **⚠️ Disclaimer:** These modules are for data structure demonstration only. They are not encrypted and should not be used for storing actual sensitive data in a production environment.
* **Biometric:** User database with fields for fingerprint images and physical characteristics.
* **Medical:** Records for health history, allergies, and medications.
* **Financial:** Income, assets, and liability tracking.
* **Legal:** Court cases and criminal record data structures.
* **Personal:** General user preferences and hobbies.

## License

GNU AGPLv3, see [LICENSE](LICENSE).
