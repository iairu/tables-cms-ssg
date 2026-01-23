now onto the next task, within built electron app there is an issue right at the beginning of Running npm install in CMS site: Uncaught Exception:
Error: spawn /Users/iairu/Desktop/TABLES CMS v22.app/Contents/Resources/support-bin/npm_source/bin/node ENOENT

tables logo in console window is also not showing properly in the packaged app

afterwards also add tables icon to be shown as app icon not just on the .app but also dock icon when running the app

---

have all uploads be purged on import

---

stop the frontend deploy timer when BUILD_END happens, allowing the user to use the buttons again

and also improve console window css now that it has more purposes than just a launch progress bar, make the console within it always visible, use the loading for builds as well, instead of height growth of the console have it be fixed height with overflow scroll-y, do not show the loading bar during deploy, make the window always on top

---

have open and save buttons next to local deploy and visit buttons, we will utilize json import/export functionality for "document saving and opening" instead. make sure to clear all user assets on open/import, remove data management from settings now that the buttons are differently placed and named

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