
have shared Head.js just like Header.js but for <head>

---

adjust main-site/src/templates based on strukshow-old-site-new-theme content (that is an old site but a newer theme we have to port over to our main-site), do not change file structure at all, just mostly update css in Header.js, Footer.js, mainly page.js, ...

main-site/static/strukshow-old-site-new-theme/src/sections/Bar.svelte is Infobar, Bubbles.svelte is ignored, Flies.svelte is Flies, Floaters.svelte is Boxes, Ranking.svelte is Ranking, Ref.svelte is References, Slide.svelte is Slide, Titulka.svelte is TitleSlide, Video.svelte is Video

---

blog is improperly showing english pinned article in both english and slovak, and not showing slovak pinned article in either

---

add sitemap to footer alongside accessibility A+ and A- buttons

---

make main-site theme mobile friendly

---

add support for page groups: page group will contain multiple pages and on main-site will be on /[lang]/[group]/[page], default group is "Direct Pages" (always exists) served on /[lang]/[page]. All currently existing pages will be moved to this group.

---

update sidemenu and routing so that Pages will be on /cms/pages, Blog on /cms/blog and so on for Pedigree on /cms/pedigree, Inventory on /cms/inventory, Attendance on /cms/attendance, Customers on /cms/customers, Employees on /cms/employees, Reservations on /cms/reservations, Calendar on /cms/calendar, Settings on /cms/settings and Extensions on /cms/extensions

update routing for actions so that page with slug will be on /cms/pages/[slug]/[action] (e.g., /cms/pages/about/edit), blog post with slug will be on /cms/blog/[yyyy/mm/slug]/[action] (e.g., /cms/blog/[2026/01/demo-slug]/edit)

similarly pedigree cats will now have ids and actions will be on /cms/pedigree/[id]/[action] (e.g., /cms/pedigree/1/edit), same for inventory on /cms/inventory/[id]/[action] (e.g., /cms/inventory/1/edit), and reservations on /cms/reservations/[id]/[action] (e.g., /cms/reservations/1/edit), and employees on /cms/employees/[id]/[action] (e.g., /cms/employees/1/edit), and customers on /cms/customers/[id]/[action] (e.g., /cms/customers/1/edit), and attendance on /cms/attendance/[id]/[action] (e.g., /cms/attendance/1/edit)

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