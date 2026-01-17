add import (json to localStorage) and export data (localStorage to json) into settings, importing will overwrite all localStorage data (clean then write)

---

add new page components and change existing as follows:

- Title Slide
    - Heading (text field)
    - Alignment (dropdown: left, center, right)
    - Heading size (normal, big)
    - Text (html text area with controls for bold, italic, strikethrough, link, quote, bullet list, numbered list)
    - Buttons (empty list of buttons with "Add button" button, once added each button has Icon (emoji picker), title (text field), link (text field), checkbox to open as popup, checkbox to show button as a button and not a link)
    - Dark theme checkbox
    - Background color picker
    - Minimal height number field
    - Background image (image upload into json as a base64 blob)
    - Mobile background image (image upload into json as a base64 blob)
    - Scale image to whole background checkbox
    - Background texture (image upload into json as a base64 blob)
    - Video transparency number field
    - Video link text field
    
- Boxes
    - Boxes (empty list of items with "Add item" button, one item has a heading text field, subheading text field, textarea called text with controls, text in lower corner text field, icon image upload, horizontal adjustment number field, vertical adjustment number field)
    - Dark theme checkbox
    - Background image upload
    
- Infobar
    - Logo image upload
    - Alternative icon if no logo (emoji picker)
    - Text (text field)
    - Buttons (empty list of buttons with "Add button" button)
    - Dark theme checkbox
    
- Flies
    - Flies (empty list of items with "Add item" button, each item has a background image upload, margin from edge percentage number field, margin from top percentage number field, rotation in degrees number field, scaling factor number field, transparency number field, show on mobile checkbox, stick to right side checkbox)
    - Blend mode dropdown (dropdown of css supported image blend modes)
    - hide overflow checkbox
    
- Slide
    - left heading text field
    - right heading text field
    - left textarea
    - right textarea
    - left list of buttons
    - right list of buttons
    - left background color picker
    - right background color picker
    - left dark theme checkbox
    - right dark theme checkbox
    - left background image picker
    - right background image picker
    - fit left background checkbox
    - fit right background checkbox
    - minimal left side height number field
    - minimal right side height number field
    - hide left side on mobile checkbox
    - hide right side on mobile checkbox
    - larger slide checkbox
    - switch order on mobile checkbox
    
- Video
    - youtube video url
    - special theme dropdown: default, iphone, iphone + autoplay, autoplay, autoplay + fullwidth

- Ranking
    - rank list width add rank button, each rank has a heading field and subheading text field
    - dark mode checkbox
    - background image upload

- References
    - list of images with add image button, each image has an image upload
    - dark theme checkbox
    
- Reviews
    - list of textareas with add textarea button, each textarea has a textarea and an author text field
    - dark theme checkbox
    
---
    
add support for multiple languages as per settings property languages (new property listing all languages that will be in a dropdown) and default lang (default editing language), then on each page and article have the ability to switch between languages while editing using a dropdown of languages previously set in settings

---

improve the theme picker in settings to show actual themes named: Default, StrukShow Brand Special, iairu Brand Special, Synthwave, Matrix, Monokai, GitHub, VSCode, Anime, Historic Paper, Senior Citizen, ayu

add "show breadcrumbs on pages and articles" toggle to settings

---

Add to each page:

- Include in navigation dropdown (with choices: none (default), header, footer)
- Dark theme toggle
- Special theme dropdown
- Site meta description textarea
- "Button and link" color picker
- Sitemap page priority

---

add extension called Rental for rental solutions (will show in side menu new cms pages: Inventory tracking table page, (Employee) Attendance tracking table page, Customer contacts table page, Customer reservations table page, Customer reservations calendar page)

fields and relational fields that are included in this extension should be saved in localStorage and based on this SQL from an older system:

- [copy sql migration here from the project]

---

add extension called Biometric for a database of users with fingerprints, face portraits, user data and sensitive data, this will be editable same way as the pedigree cats table with an expand button, show a warning within the picker that this is for demo only due to low or non-existent security