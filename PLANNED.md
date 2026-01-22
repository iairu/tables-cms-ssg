now we have successfully:
1. put node npm npx to electron-bin/npm_source/bin as it should be
2. setup electron-main.js to use that node npm npx to npm run develop which i verified without issues
3. have working bundle-node-npm.js that runs before any electron-specific package.json commands only
good, now we have to do this:
1. copy main-site to project resource path so it is editable within distributed electron app: done electron-builder automatically based on package.json, no changes needed
2. use said main-site from project resources if running distributed electron app, otherwise if only running "electron ." in other words "npm start" we need to use the existing main-site in project directory
3. in other words: within dist release have src/api/*.js use main-site in resources path else if running non-dist use main-site directly

cmsSite is the root project with __dirname and main-site is the output project of cmsSite, we want electron to run cmsSite and src/api/build.js to deploy from cmsSite to editable main-site then that main-site within the same api goes to vercel, all of this is already working, do not touch it and do the steps i told you

fix the following electron-main.js problem:
Console window created.
Starting Gatsby development server using bundled node and npm...
Running npm install in CMS site...
spawn ENOTDIR
Failed to set up the environment.

perhaps pull the bundled node and npm from project resources (see package.json extraResources) if IS_PACKAGED is true, create and manage the IS_PACKAGED variable within the electron-main.js file based on whether the app is packaged or not

---

blog is improperly showing english pinned article in both english and slovak, and not showing slovak pinned article in either

---

have the export data and import data option within Settings include all uploads from static/uploads folder, so that they are added into the folder (replace if exists) on import

---

add support for page groups: page group will contain multiple pages and on main-site will be on /[lang]/[group]/[page], default group is "Direct Pages" (always exists) served on /[lang]/[page]. All currently existing pages will be moved to this group.

---

update routing so that Pages will be on /cms/pages, Blog on /cms/blog and so on for Pedigree on /cms/pedigree, Inventory on /cms/inventory, Attendance on /cms/attendance, Customers on /cms/customers, Employees on /cms/employees, Reservations on /cms/reservations, Calendar on /cms/calendar, Settings on /cms/settings and Extensions on /cms/extensions, current state: all navigation resolves to /cms/pages

update routing for actions so that page with slug will be on /cms/pages/edit?slug=[slug] (e.g., /cms/pages/about/edit), blog post with slug will be on /cms/blog/edit?route=[yyyy/mm/slug] (e.g., /cms/blog/edit?route=2026/01/demo-slug)

similarly pedigree cats will now have ids and actions will be on /cms/pedigree/edit?id=[id] (e.g., /cms/pedigree/edit?id=1), same for inventory on /cms/inventory/edit?id=[id] (e.g., /cms/inventory/edit?id=1), employees on /cms/employees/edit?id=[id] (e.g., /cms/employees/edit?id=1), and customers on /cms/customers/edit?id=[id] (e.g., /cms/customers/edit?id=1), and attendance on /cms/attendance/edit?id=[id] (e.g., /cms/attendance/edit?id=1)

clicking any button within SideMenu will always navigate even if already on the given section, same for clicking any Edit button (e.g. within /cms/pages table)

---

add asset upload and management extension (will switch upload to json for select from assets on all file upload input fields)

---

add slideshow page component with support for multiple slides, transitions, and autoplay

---

add extension called Biometric for a database of users with fingerprints imgs (left thumb, right thumb, palm), face mugshot (with grouping and better sort: front, back, left side, right side), user data and sensitive data (place of origin, date of birth, gender, height, weight, eye color, hair color, skin color, blood type, Rh factor, national ID, social security number, passport number, driver's license number, first name, last name, middle names, marriage status, children, spouse name, ...), this will be editable same way as the pedigree cats table with an expand button, show a warning within the picker that this is for demo only due to low or non-existent security

---

manual: improve page components editor by having components in two or multiple columns where relevant, make mobile friendly

---

improve pedigree family and descendants trees by color coding sire/male light blue and dam/female pink, add links to parents and siblings expandos

add more features to pedigree extension including breed history, and genetic analysis

---

add movie and show tracker extension (uses imdb numbering)

---

improve the theme picker in settings to show actual themes (CSS) named: Default (Current CSS in main-site), Synthwave, Matrix, Monokai, GitHub, VSCode, Anime, Historic Paper, Senior Citizen, ayu; add css for all of these themes to the main-site frontend, utilize body class "theme-[themeName]" to switch between them

---

add notes extension

---

one of the following:

- e-commerce extension (external integration e.g. snipcart)
- visual editor for pages

---

public server for establishing rental businesses form (localStorage sync with "Currently edited by ...") collaboration over websocket across multiple networks, this server will be always pinged by any cms instance that has collaboration features enabled in settings, user will be informed and will have to provide GDPR consent that their IP, localization and a shared collaboration token (no auth for now, later additional token will be required) are stored on the server for the purpose of establishing a websocket connection between all clients in the given business