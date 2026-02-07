# Architecting a Hybrid Peer-to-Peer Collaborative CMS within an Electron-Gatsby Environment

## 1. Executive Summary

The modern Content Management System (CMS) landscape has shifted paradigmatically toward real-time, multi-user collaboration, a standard established by cloud-native platforms like Figma and Google Workspace. However, the application in question—a Gatsby-based Static Site Generator (SSG) encapsulated within an Electron desktop runtime—presents a distinctive architectural challenge. Unlike centralized web applications, this system operates as a local, standalone executable managing a file-based data source (`main-site` JSON) and a local build pipeline (`api/build.js`). To introduce collaborative features where one instance acts as a server for others on a local area network (LAN), we must engineer a hybrid "host-client" architecture that elevates a standard client instance into a WebSocket authority while strictly constraining its capabilities to ensure data integrity.

This research report provides an exhaustive technical blueprint for implementing a collaborative WebSocket server within the existing Gatsby-Electron infrastructure. The proposed solution involves modifying the Electron Main process to spawn a Socket.IO server when a specific "Server Mode" setting is toggled. This server will broker connections between peer clients within the company, implementing a **Pessimistic Locking** protocol to manage concurrency. This ensures that while multiple users may view the CMS, only one user can edit a specific field at any given moment, with their input synchronized in real-time (ghost text) to all viewers. Crucially, the architecture adheres to a strict security and integrity constraint: the host instance functions in a read-only capacity regarding content entry, serving solely as the synchronization hub, file system arbiter, and build dispatcher via `api/build.js`.

The report details the necessary settings configuration, including network discovery mechanisms, the precise event-driven protocols for field locking and live synchronization, and the React component patterns required to render remote presence indicators. It further explores the integration of the build API, ensuring that the deployment pipeline remains centralized and consistent despite the distributed nature of the editing session.

## 2. Architectural Paradigm: The Hybrid Desktop-Server Model

### 2.1 The Inversion of Control in Electron

Standard Electron architecture adheres to a strict separation of concerns where the **Main Process** handles system-level operations (window management, native menus) in a Node.js environment, and the **Renderer Process** handles the user interface in a Chromium-based sandbox. Typically, Electron apps act as clients consuming data from remote APIs. The requirement to transform one instance into a "Server" necessitates inverting this relationship.

In this "Server Mode," the Electron application acts as the API provider for other instances on the LAN. This requires the Main Process to bind to a TCP port and listen for incoming WebSocket connections, effectively turning the desktop application into a micro-server. Because the Gatsby/React Renderer acts within a browser sandbox, it lacks the privileges to host such a server directly. Therefore, the architecture relies on a robust **Inter-Process Communication (IPC)** bridge. The Renderer serves as the control panel, sending `IPC_START_SERVER` commands to the Main Process, which then instantiates the Socket.IO server using Node.js primitives.

This design choice has profound implications for data flow. The Main Process becomes the "Source of Truth" for the collaborative session. It must hold the in-memory state of all active field locks, connected user identities, and pending build requests. The Renderer on the host machine becomes just another client—albeit a privileged one with direct IPC access—connecting to its own Main Process via a local loopback address, yet restricted by the global "read-only" policy mandated by the requirements.

### 2.2 Network Discovery and the LAN Ecosystem

Deploying a server within a corporate LAN introduces the challenge of service discovery. Unlike cloud servers with static DNS entries, the host machine's IP address is dynamic, assigned by the local DHCP server. For a "plug-and-play" experience, the system must facilitate easy connection without requiring users to be network engineers.

The Main Process must utilize the `os.networkInterfaces()` module to interrogate the host machine's network adapters. By filtering for IPv4 addresses that are not internal loopbacks (127.0.0.1) and identifying standard interface names (e.g., `en0`, `eth0`), the system can deduce the machine's LAN IP address (e.g., `192.168.1.15`). This IP, paired with a user-configured port (defaulting to, say, 3000), forms the **Connection String** displayed in the Settings view. Peer clients input this string to establish a persistent, bidirectional WebSocket connection.

### 2.3 The Role of the Host Instance: Arbiter and Builder

The prompt specifies that the "server will not have the ability to edit any fields." This constraint transforms the Host Instance into a dedicated administrative console during collaborative sessions. While visual editing is disabled, the Host retains a critical role: **Persistence and Deployment**.

In the single-user model, the Gatsby app writes directly to the `main-site` JSON files. In the collaborative model, peer clients cannot write to the Host's file system directly. Instead, they emit `REQUEST_SAVE` events. The Host accepts these payloads, serializes the data to the local disk, and then triggers the `api/build.js` script to deploy the static site. This centralization prevents race conditions on the file system and ensures that the deployment pipeline is executed in a controlled environment, leveraging the Host's authenticated credentials for Vercel deployment.

## 3. Detailed Protocol Design: Pessimistic Locking and Sync

Real-time collaboration generally bifurcates into **Optimistic Concurrency Control** (used by Google Docs via Operational Transformation or CRDTs) and **Pessimistic Locking**. The requirement that "the field will be disabled while being edited by another client" explicitly mandates a Pessimistic Locking strategy. This approach trades the complexity of merge conflict resolution for the stability of exclusive access, which is often preferable for structured CMS data where field integrity is paramount.

### 3.1 The Locking Lifecycle

The protocol defines a finite state machine for every form field, managed centrally by the Host.

#### 3.1.1 Lock Acquisition (Focus)

When a client (User A) focuses on an input field, the client does not immediately unlock the UI for typing. Instead, a `LOCK_REQUEST` event is emitted to the server containing the `fieldId` and `userId`.

- **Server Logic:** The server checks an in-memory `LockMap`.
  - If the key `fieldId` is missing, the lock is available. The server records `{ fieldId: socketId_A }` and emits `LOCK_GRANTED` to Client A. It simultaneously broadcasts `LOCK_TAKEN` to all other connected clients, carrying metadata about User A (name, avatar).
  - If the key `fieldId` exists, the lock is unavailable. The server emits `LOCK_DENIED` to Client A.
- **Client A Logic:** Upon receiving `LOCK_GRANTED`, the input becomes editable.
- **Client B Logic:** Upon receiving `LOCK_TAKEN`, the input becomes disabled, and a visual indicator (e.g., "Alice is editing...") appears.

#### 3.1.2 Live Synchronization (Ghost Text)

Once the lock is secured, User A begins typing. To fulfill the requirement of showing "live contents," the client emits `SYNC_UPDATE` events on every keystroke (throttled).

- **Payload:** `{ fieldId, value, caretPosition }`.
- **Broadcasting:** The server relays this payload via `VALUE_UPDATED` to all clients *except* the sender.
- **Ghosting:** Client B receives `VALUE_UPDATED`. Since the field is locked locally, the React component updates the displayed value. This allows Client B to watch the content evolve in real-time, creating a "ghost writing" effect.

#### 3.1.3 Lock Release (Blur)

When User A leaves the field (blur event), a `LOCK_RELEASE` event is sent.

- **Server Logic:** The server removes the `fieldId` from the `LockMap` and broadcasts `LOCK_RELEASED`.
- **Client B Logic:** The field re-enables, allowing Client B to potentially acquire the lock.

### 3.2 Handling Zombie Locks via Presence Management

A major vulnerability of pessimistic locking is the "Zombie Lock"—a scenario where a client crashes or disconnects while holding a lock, leaving the field permanently disabled for others. The Socket.IO protocol provides robust disconnection detection.

The Server must implement a cleanup routine:

1. **Connection Monitoring:** Listen for the `disconnect` event on every socket.
2. **Lock Reclamation:** On disconnect, iterate through the `LockMap`. Identify all keys associated with the disconnected `socket.id`.
3. **State Reset:** Delete these entries and immediately broadcast `LOCK_RELEASED` for each reclaimed field. This ensures the system self-heals and availability is restored immediately upon a user's departure.

## 4. Settings View Configuration and UI Requirements

The Settings view is the command center for the collaborative session. To facilitate the "Server Mode," we must introduce a specific set of fields and controls that manage the Electron/Node lifecycle.

### 4.1 Server Mode Configuration

The interface should include a "Collaboration" panel with the following elements:

**Table 1: Required Settings Fields**

| **Field Label**          | **Type**          | **Description & Functionality**                              |
| ------------------------ | ----------------- | ------------------------------------------------------------ |
| **"Enable Server Mode"** | Toggle/Switch     | **Primary Control.** When ON, triggers `ipcRenderer.invoke('start-server')`. When OFF, sends `stop-server`. This toggle also activates the global `isHostMode` flag, disabling all local editing inputs. |
| **"Your Display Name"**  | Text Input        | **Identity.** Required for all users (Host and Client). This string (e.g., "Product Team") is sent with lock requests so peers see "Product Team is editing" rather than a raw Socket ID. |
| **"Server Port"**        | Number Input      | **Network Config.** Defaults to `3000`. Allows the host to specify a port if the default is occupied. Used by the Main Process to bind the `httpServer`. |
| **"Access Token"**       | Password Input    | **Security.** A shared secret or PIN (e.g., "cms-2024"). The server validates this token during the WebSocket handshake to prevent unauthorized LAN connections. |
| **"Host Address"**       | Read-Only Display | **Discovery (Server Only).** Once the server starts, this field displays the resolved LAN IP (e.g., `192.168.1.5:3000`) so the user can read it out to colleagues. |
| **"Connect to Host"**    | Text Input        | **Client Config.** (Visible only if Server Mode is OFF). Clients paste the Host Address here to initiate the connection. |

### 4.2 Visualizing Connection State

The Settings view must also provide feedback on the connection health:

- **Host View:** Displays a list of "Connected Peers" (e.g., "Connected: 3 users"). This list is updated via `CLIENT_JOINED` and `CLIENT_LEFT` events.
- **Client View:** Displays a status indicator: "🟢 Connected", "🟡 Connecting...", or "🔴 Disconnected". This relies on Socket.IO's built-in `connect` and `disconnect` client-side events.

## 5. Implementation Strategy: The Server (Electron Main Process)

The server logic resides entirely within the Electron Main process (`main.js` or `background.js`) to access system networking capabilities.

### 5.1 Initialization via IPC

The architecture uses `ipcMain` to handle the startup request. This ensures the server is only running when explicitly requested, conserving resources.

JavaScript

```
// Main Process (main.js)
const { ipcMain } = require('electron');
const http = require('http');
const { Server } = require("socket.io");
const os = require('os');

let io; 
let server;
let activeLocks = new Map(); // <fieldId, { socketId, userName }>

ipcMain.handle('start-server', async (event, { port, token }) => {
    if (server) return { status: 'running' };

    const httpServer = http.createServer();
    io = new Server(httpServer, {
        cors: { origin: "*" }, // Allow LAN access
        pingTimeout: 60000     // Robustness against latency
    });

    // Middleware for Authentication
    io.use((socket, next) => {
        const clientToken = socket.handshake.auth.token;
        if (clientToken === token) next();
        else next(new Error("Invalid Access Token"));
    });

    io.on('connection', (socket) => {
        // Send current state (locks) to new user
        socket.emit('sync-state', Array.from(activeLocks.entries()));

        socket.on('request-lock', ({ fieldId, userName }) => {
            if (!activeLocks.has(fieldId)) {
                activeLocks.set(fieldId, { socketId: socket.id, userName });
                socket.emit('lock-granted', fieldId);
                socket.broadcast.emit('lock-taken', { fieldId, userName });
            } else {
                socket.emit('lock-denied', fieldId);
            }
        });

        socket.on('sync-update', (payload) => {
            // Validate ownership before broadcasting
            const lock = activeLocks.get(payload.fieldId);
            if (lock && lock.socketId === socket.id) {
                socket.broadcast.emit('value-updated', payload);
            }
        });

        socket.on('release-lock', (fieldId) => {
            const lock = activeLocks.get(fieldId);
            if (lock && lock.socketId === socket.id) {
                activeLocks.delete(fieldId);
                socket.broadcast.emit('lock-released', fieldId);
            }
        });

        socket.on('request-build', () => {
             // Trigger api/build.js logic here
             executeBuild(); 
        });

        socket.on('disconnect', () => {
            // Zombie Lock Cleanup
            for (const [field, owner] of activeLocks.entries()) {
                if (owner.socketId === socket.id) {
                    activeLocks.delete(field);
                    io.emit('lock-released', field);
                }
            }
        });
    });

    server = httpServer.listen(port, '0.0.0.0');
    return { ip: getLocalIpAddress(), status: 'started' };
});
```

### 5.2 Build Pipeline Integration (`api/build.js`)

The `api/build.js` script is the bridge between the live collaborative state and the static output.

1. **Trigger:** A client emits `request-build`.
2. **Execution:** The Main Process (Server) receives this event. It first writes the current in-memory data state to the `main-site` JSON file on the host's disk.
3. **Process Spawning:** The Server uses `child_process.fork` or `exec` to run `api/build.js`.
4. **Feedback:** The stdout/stderr from the build script is captured and emitted back to all clients via a `build-status` event, allowing everyone to see "Building..." -> "Deployed" progress bars in their UI.

## 6. Implementation Strategy: The Client (Gatsby/React)

The Gatsby frontend requires a **Collaboration Context** to manage the socket connection and a **Higher-Order Component (HOC)** to wrap form fields.

### 6.1 Global Collaboration Context

This context holds the `socket` instance, the `locks` map, and the `isServerMode` flag.

JavaScript

```
// src/context/CollaborationContext.js
export const CollaborationProvider = ({ children }) => {
    const = useState(null);
    const [locks, setLocks] = useState(new Map()); 
    const = useState(false);

    // Effect to listen for global lock updates
    useEffect(() => {
        if (!socket) return;
        
        socket.on('lock-taken', ({ fieldId, userName }) => {
            setLocks(prev => new Map(prev).set(fieldId, userName));
        });
        
        socket.on('lock-released', (fieldId) => {
            setLocks(prev => {
                const next = new Map(prev);
                next.delete(fieldId);
                return next;
            });
        });
    }, [socket]);

    return (
        <CollaborationContext.Provider value={{ socket, locks, isServerMode }}>
            {children}
        </CollaborationContext.Provider>
    );
};
```

### 6.2 The `CollaborativeInput` Component

Every input field in the CMS must be replaced or wrapped with `CollaborativeInput`. This component handles the visual logic for locking and ghost text.

- **Read-Only Host Logic:** The component checks `isServerMode`. If true, the input is rendered with the `disabled` attribute set to `true`. This creates a hard stop for editing on the server instance, satisfying the "server will not have the ability to edit" requirement.
- **Lock Visualization:** If `locks.has(fieldId)` and the owner is not the current user, the input is disabled. A CSS class is applied to give it a colored border (e.g., orange), and a small tooltip/badge is rendered above the field: *"Editing: [User Name]"*.
- **Live Sync:** The component listens for `value-updated`. If an update arrives for its `fieldId` and the field is locked by another user, the component updates its internal value state to match the payload, rendering the text as it is typed remotely.

## 7. Security and Network Considerations

### 7.1 LAN Security

Opening a port on `0.0.0.0` exposes the application to the entire local network. While company networks are generally trusted, best practices dictate implementing an **Authentication Handshake**. The "Access Token" configured in Settings is passed in the `auth` object of the Socket.IO client options: `const socket = io(url, { auth: { token: "secret-123" } });` The server middleware verifies this token before allowing the connection upgrade, preventing unauthorized devices on the WiFi from connecting to the CMS session.

### 7.2 Firewall Configuration

The Host machine's operating system (Windows Defender Firewall or macOS Gatekeeper) may block the incoming connections to the Node.js server. The application documentation must explicitly instruct users to "Allow Node.js/Electron to accept incoming connections" when prompted by the OS. Failure to do so will result in connection timeouts for peer clients.

## 8. Conclusion

By leveraging the dual-process architecture of Electron, the Gatsby CMS can be successfully refactored into a collaborative platform without external cloud dependencies. The **Main Process** acts as the authoritative synchronization hub, utilizing **Pessimistic Locking** to ensure collision-free editing and **Socket.IO** for robust real-time communication.

The implementation satisfies all key requirements:

- **"Server Mode" Settings:** Provides the control interface and discovery info.
- **Field Locking:** Prevents concurrent edits via strict server-side arbitration.
- **Live Sync:** Propagates typing events to create a "ghost text" experience.
- **Read-Only Host:** Enforced via global context flags and server-side logic.
- **Build Integration:** Centralizes the `api/build.js` execution on the Host, ensuring data consistency.

This architecture transforms the application from a solitary tool into a team-centric workspace, enabling simultaneous content creation while maintaining the simplicity and security of a local network application.

### Citation Reference Table

| **ID** | **Source Context**                                           |
| ------ | ------------------------------------------------------------ |
|        | Electron process model: Main vs Renderer responsibilities.   |
|        | IPC communication patterns (`ipcMain`, `ipcRenderer`).       |
|        | Using `os.networkInterfaces` to retrieve LAN IP addresses.   |
|        | Socket.IO features: fallbacks, auto-reconnection, reliability. |
|        | Pessimistic Locking vs Optimistic Concurrency strategies.    |
|        | UX patterns for collaboration: presence indicators and lock badges. |
|        | Implementing live input synchronization ("ghost text") in React. |
|        | Strategies for real-time backend sync and persistence.       |
|        | Implementing global read-only/disabled states in React forms. |
|        | Handling disconnections and cleaning up "Zombie Locks".      |
|        | Socket.IO authentication and security via tokens.            |
|        | Real-time notifications and build status updates.            |
|        | React Context API for global state management in Gatsby.     |
|        | Socket.IO protocol and event types.                          |
|        | Locking resources using WebSockets.                          |
|        | WebSocket implementation patterns in React.                  |
|        | Tracking user state and edits in collaborative editors.      |
|        | Collaborative form field settings and permissions.           |
|        | React form building best practices.                          |
|        | Live updating of input fields and broadcasting changes.      |
|        | Handling race conditions and acknowledgements.               |