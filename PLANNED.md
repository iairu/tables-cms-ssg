
attendance is missing confirm delete modal like one present in inventory, same for reservations

---

make sure that if an extension is disabled by user (e.g. Blog disabled on /cms/extensions), that it will not be visible after export to main-site (in this case no blog articles will be exported despite existing in localStorage and the Blog menu entry will not exist, then once user re-enables Blog the export will work like before with all visible and existing)

implement the changes, storing of extensions status is already done in localStorage, next up do the filtering

---

apply extracted css added to default.css by editing original files mentioned in default.css to include given classNames instead of the css directly

---

whenever i edit a slug within blog or page it causes redirect because the slug is changing live, fix by utilizing id of the page instead of a slug, same for blog posts

---

create a new Header that is meant to be above both SideMenu and main, move "Visit Domain", "Build and Deploy" and "Build Locally Only" buttons into it to the right side, but a SearchBar (like the one in vscode) into middle (for now it will display placeholder search results with fuzzy search) and add logo to the left side of the new Header

---

adjust main-site/src/templates based on strukshow-old-site-new-theme content (that is an old site but a newer theme we have to port over to our main-site), do not change file structure at all, just mostly update css in Header.js, Footer.js, mainly page.js, ...

main-site/static/strukshow-old-site-new-theme/src/sections/Bar.svelte is Infobar, Bubbles.svelte is ignored, Flies.svelte is Flies, Floaters.svelte is Boxes, Ranking.svelte is Ranking, Ref.svelte is References, Slide.svelte is Slide, Titulka.svelte is TitleSlide, Video.svelte is Video

---

add vercel project name (only a-z and dashes allowed) as required next to vercel api key

---

blog is improperly showing english pinned article in both english and slovak, and not showing slovak pinned article in either

---

add sitemap to footer alongside accessibility A+ and A- buttons

---

make main-site theme mobile friendly

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