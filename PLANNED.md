if i have two languages: english as default and slovak set in settings, then blog is improperly showing english pinned article in both english and slovak, and not showing slovak pinned article at all

---

add support for page groups: page group will contain multiple pages and on main-site will be on, default group is "Direct Pages" (always exists and contains Homepage). All currently existing pages will be moved to this group. Each group will represent a "dropdown" menu entry in header (not actual dropdown, but hovering will expand to show pages in that group)

---

add slideshow page component with support for multiple slides (slide can contain an image (upload asset + select asset) or a video link), transitions, and autoplay

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