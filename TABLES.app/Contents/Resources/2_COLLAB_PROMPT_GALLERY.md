# Collaboration Prompt Gallery

This gallery contains a sequence of robust, context-aware prompts designed to guide an AI assistant through the implementation of the Collaborative CMS features. It is structured into **Alpha (MVP)**, **Beta (Feature Complete)**, and **Release (Production)** phases.

> **Usage:** Copy into your AI chat interface. Ensure `1_COLLAB_RESEARCH.md` is in context for architectural alignment.

---

## Phase 1: Alpha (Core Infrastructure)
*Goal: Establish the WebSocket backbone, server hosting capability, and basic peer-to-peer connectivity.*

### Prompt 1.1: Architecture & Server Initialization
**Context:** `electron-main.js`, `electron-preload.js`, `package.json`
**Objective:** Add `socket.io` dependencies and implement the "Server Mode" switch in the Main process.

```markdown
We are building a local peer-to-peer collaboration feature for our Electron+Gatsby CMS.
Reference `1_COLLAB_RESEARCH.md` Section 5.1 for the architectural blueprint.

Please perform the following:
1.  **Dependencies:** Add `socket.io` and `socket.io-client` to the project if missing.
2.  **IPC Bridge:** Update `electron-preload.js` to expose `collab-start-server`, `collab-stop-server`, and `collab-get-ip`.
3.  **Main Process Logic (`electron-main.js`):**
    -   Import `socket.io` and `http`.
    -   Implement `startServer(port)`:
        -   Create an HTTP server instance.
        -   Initialize `Socket.IO` with CORS enabled for LAN access.
        -   Bind to `0.0.0.0` to allow external connections.
        -   Return the local LAN IP address (use `os.networkInterfaces` to find the non-internal IPv4).
    -   Implement `stopServer()`: Gracefully close the instance.
    -   Maintain a `connectedClients` Map to track socket connections.

**Verification:**
-   Create a verify step to check that `require('socket.io')` works.
-   Ensure the server logs "Listening on 0.0.0.0:PORT" to the console.
```

### Prompt 1.2: Settings UI for Host/Client
**Context:** `cms-site/src/components/cms/sections/SettingsSection.js`, `cms-site/src/hooks/useCMSData.js`
**Objective:** Create the control panel for users to Host or Join a session.

```markdown
We need a UI to control the collaboration server.
Reference `1_COLLAB_RESEARCH.md` Section 4 for the UI requirements.

Please update `SettingsSection.js` and `useCMSData.js`:
1.  **State Management (`useCMSData.js`):**
    -   Add state for `collabState`: `{ isServer, isConnected, serverIP, connectedClients }`.
    -   Add functions `startCollaborationServer()` and `connectToCollaborationServer(ip)`.
2.  **Settings UI (`SettingsSection.js`):**
    -   Add a "Collaboration" card/section.
    -   **Host Mode:** Button to "Start Server". Display "Server running at [IP]:[PORT]" when active.
    -   **Client Mode:** Input field for "Host IP" and Button to "Connect".
    -   **Status:** Show a list of "Connected Peers" (just raw Socket IDs for now is fine).

**Constraints:**
-   Use `window.electron` APIs exposed in the previous step.
-   Ensure the UI creates a visually distinct "Host" vs "Client" state.
```

---

## Phase 2: Beta (Locking & Sync)
*Goal: Implement Pessimistic Locking to prevent conflicts and enable "Ghost Text" visualization.*

### Prompt 2.1: Server-Side Locking Protocol
**Context:** `electron-main.js`
**Objective:** Implement the state machine for managing field ownership.

```markdown
We are implementing Pessimistic Locking.
Reference `1_COLLAB_RESEARCH.md` Section 3.1 regarding the Locking Lifecycle.

Update `electron-main.js` to handle these specific Socket.IO events:
1.  **State:** Add `activeLocks = new Map()` (FieldID -> { SocketID, UserName }).
2.  **Events:**
    -   `register-client`: Store user's display name.
    -   `request-lock`:
        -   If field is free: Grant lock, emit `lock-granted` to sender, broadcast `lock-taken` to others.
        -   If field is busy: Emit `lock-denied`.
    -   `release-lock`: Remove from map, broadcast `lock-released`.
    -   `disconnect`: **CRITICAL** - Clean up any locks held by the disconnected socket (Zombie protection).

**Verification:**
-   Ensure that if Client A holds a lock, Client B's request is denied.
-   Ensure that when Client A disconnects, the lock is automatically freed.
```

### Prompt 2.2: Client-Side Locking & Hooks
**Context:** `cms-site/src/hooks/useCMSData.js`, `cms-site/src/components/cms/utils.js`
**Objective:** Consume lock events and manage input responsiveness.

```markdown
Update `useCMSData.js` to handle the locking protocol:
1.  **Listeners:**
    -   `lock-taken`: Update local `activeLocks` state.
    -   `lock-released`: Remove from local `activeLocks` state.
    -   `lock-granted`: Allow local focus on the field.
2.  **Actions:**
    -   `requestLock(fieldId)`: Emit event to server.
    -   `releaseLock(fieldId)`: Emit event to server on blur.
3.  **Syncing:**
    -   Listen for `data-update` (settings changes) and update local React state immediately ("Ghost Sync").

**Constraint:**
-   Ensure `activeLocks` is an array/map available to all child components via the return object of `useCMSData`.
```

### Prompt 2.3: Visualizing Locks in Settings
**Context:** `cms-site/src/components/cms/sections/SettingsSection.js`
**Objective:** Disable inputs and show who is editing.

```markdown
Implement the visual feedback for field locking in `SettingsSection.js`.
Reference `1_COLLAB_RESEARCH.md` Section 6.2.

1.  **Wrapper Component:** Create a `LockedInputWrapper` component.
    -   Props: `fieldId`, `children`.
    -   Logic: Look up `fieldId` in `collabState.activeLocks`.
    -   **If locked by another:**
        -   Render children with `disabled={true}`.
        -   Render a badge/tooltip: "Editing: [User Name]".
        -   Add a border style (e.g., Orange/Red) to indicate busy state.
    -   **Event Interception:**
        -   `onFocus`: Call `requestLock(fieldId)`.
        -   `onBlur`: Call `releaseLock(fieldId)`.
2.  **Integration:** Wrap key inputs (Site Title, Deployment keys) in `SettingsSection` with this wrapper.

**Verification:**
-   Open two instances. Focus an input in Instance A. Verify Instance B sees it disabled and labeled with Instance A's name.
```

---

## Phase 3: Release (Polish & Security)
*Goal: Secure the connection, ensure persistence, and handle edge cases for a production-ready feature.*

### Prompt 3.1: Build Pipeline integration
**Context:** `electron-main.js`, `cms-site/src/api/build.js`, `useCMSData.js`
**Objective:** Allow clients to trigger builds (saves) that execute on the Host machine.

```markdown
The "Client" instances cannot write to disk. They must request the "Host" to save and build.
Reference `1_COLLAB_RESEARCH.md` Section 2.3.

1.  **Server (`electron-main.js`):**
    -   Listen for `request-save-and-build` event.
    -   Payload: Full settings/data object.
    -   Action: Write payload to disk (updating `data/*.json`).
    -   Action: Trigger the existing `api/build.js` script (or `npm run build`).
    -   Broadcast `build-status` updates (logs/percentage) to all clients.
2.  **Client (`useCMSData.js`):**
    -   Modify `triggerBuild`: If `collabState.isClient` is true, emit `request-save-and-build` instead of calling the local API.
    -   Listen for `build-status` to show the global progress bar.

**Robustness Check:**
-   Ensure multiple clients don't trigger simultaneous builds (Implement a simple build queue or "busy" flag on the server).
```

### Prompt 3.2: Security Token & Connection Hardening
**Context:** `electron-main.js`, `SettingsSection.js`
**Objective:** Prevent unauthorized LAN access.

```markdown
Add a security layer to the collaboration server.
Reference `1_COLLAB_RESEARCH.md` Section 7.1.

1.  **Settings:** Add a "Security Pin" or "Access Token" field in the Host UI.
2.  **Server:** Update `socket.io` initialization to use middleware:
    -   Check `socket.handshake.auth.token`.
    -   Disconnect if it doesn't match the Host's configured token.
3.  **Client:** Update the "Connect" UI to ask for this Token. Pass it in the `io()` constructor.
4.  **Error Handling:** Handle `connect_error` on the client to show "Invalid Token" message.

**Verification:**
-   Try to connect with a wrong token. Ensure connection is rejected immediately.
```

### Prompt 3.3: Final Resilience & Cleanup
**Context:** `0_COLLAB_INIT_PROMPTS.md` (Reviewing overall scope)
**Objective:** Final polish for error states and network edge cases.

```markdown
Perform a final resilience pass on the Collaboration feature.

1.  **Network Discovery:** Add a `Refresh IP` button in Host settings in case the laptop changes networks (WiFi <-> Ethernet).
2.  **Reconnection Strategy:** Configure `socket.io-client` with `reconnectionAttempts: 5` and exponential backoff to handle spotty WiFi.
3.  **UI Polish:**
    -   Add "Host (Read-Only)" indicator globally when in Server Mode.
    -   Ensure `SettingsSection` inputs are grayed out on the Host machine itself (as per requirements: "server will not have the ability to edit").

**Deliverable:**
-   A fully robust, crash-resistant collaboration module that self-heals after network interruptions.
```
