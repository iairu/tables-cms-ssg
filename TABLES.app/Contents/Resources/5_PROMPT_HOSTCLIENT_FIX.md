the app starts in host mode, however it should always start in client mode
the app starts in host mode, but when i switch to another section and back to settings it sometimes turns into client mode and sometimes into host mode which means improper persistence
here is terminal log for a single app with no other apps running, clearly showing that the same app re-registers as a client into its own host mode multiple times (whenever navigation occurs to/from settingssection)

Collaboration Server running at http://192.168.55.2:8081
Starting UDP broadcast for 192.168.55.2 on port 41234
Client connected: CWz8mpTG6kA3o_bWAAAC from 192.168.55.2
Client connected: BwQEjbELVH5nfU18AAAD from 192.168.55.2
Host registered: CWz8mpTG6kA3o_bWAAAC
Host registered: BwQEjbELVH5nfU18AAAD
Client connected: JgJeli3NGDUpATB9AAAF from 192.168.55.2
Client connected: UDTgKUaTHqcR2Z9RAAAH from 192.168.55.2
Host registered: UDTgKUaTHqcR2Z9RAAAH

also the client mode connection does not keep showing up as connected when i navigate away from settings and back it appears as client mode ready to connect

---


following problems exist on both ends since we started working on collaboration servers and clients: edit button in page actions no longer works, currently edited page title gets properly propagated across clients, currently enabled extensions do get propagated within extensions page, but do not update sidemenu accordingly, uploading new assets no longer works, added pages have disappeared after server termination (changes are not being properly saved into server local storage), all fields are disabled in new blog article, edit button doesn't work for blog articles either

---

on "Saved content type 'extensions' to disk" make the SideMenu refresh
add a slight delay on Page edits so that "Saved content type 'pages' to disk" is not spammed
on page edit instead of fields becoming temporarily disabled i get "Could not edit field. It is currently locked by undefined" alert which i can not get out of as it retriggers because i am still in the same field
"select customer" and "responsible employee" in ReservationsSection do not get synced across server clients, "item name" does get synced
look for all other fields that do not get synced and make sure they sync (including disabled attribute while lock active by another client)

---

adjust 
release.yml
 so that it builds gatsby, so that the artifact will include prebuilt files including node_modules necessary for gatsby serve to work, this way we want to avoid building within distributed app

---

PageGroupsSection group name does not have locking, same for select sire and select dam in expand Pedigree, when a client connects to a server make the client localStorage contents be replaced with server as initial sync of all data so that both have the same data and no leftovers from before connecting to the server, sidemenu is still not refreshing when i press disable/enable in ExtensionsView