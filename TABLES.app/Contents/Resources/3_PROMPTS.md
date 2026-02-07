we will not continue with prompt 3.2 nor 3.3, now we need the same collaborative feature to work on all pages, all blog posts, etc. all input fields found within the app

continue making the entire collaboration feature more robust for local network collaboration, also have clients auto-detect the server node if possible

make the collaboration feature more robust

show each client name within any field that is currently being remotely edited for all other clients to see which client is responsible, apply this to all input fields across the cms-site

make the visual lock feedback more robust

if collaboration sync of changes is not yet handled a suggestion from me (perhaps there is a more robust way to do this, if so do it more robust): every few ms send localStorage diff to server and have server respond with its localStorage diff to sync all changes over socket, alternatively have all clients send changes across sockets to all other clients, whichever is more robust
