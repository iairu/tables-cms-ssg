# 4. New Prompt Gallery: Advanced Collaboration Features

This gallery contains follow-up prompts to enhance the feature set and robustness of the collaboration system, building upon the "completed" prompts.

## Prompt 7: Advanced Network Configuration (Extends 1.1)
**Objective:** Allow users to select specific network interfaces and support IPv6.
**Context:** Currently, the server binds to `0.0.0.0` and guesses the local IP. Multi-interface devices (e.g., with VPNs or Virtual Adapters) might pick the wrong IP.
**Tasks:**
-   **Electron Main:** Update `getLocalIP` to return a list of all available interfaces (Name, IPv4, IPv6).
-   **Settings UI:** Add a dropdown in "Host Mode" to select which network interface to broadcast/display.
-   **Robustness:** Implement IPv6 support for `socket.io` and Discovery.
-   **Verification:** Verify correct IP is displayed when switching between WiFi and Ethernet.

## Prompt 8: Connection Profiles & History (Extends 1.2)
**Objective:** Improve UX by saving recent connections and managing trusted servers.
**Context:** Clients currently have to re-enter IP/Name every time they restart if not auto-discovered.
**Tasks:**
-   **useCMSData:** Persist `recentConnections` list in `localStorage`.
-   **Settings UI:** Display "Recent Servers" list with "Quick Connect" buttons.
-   **Feature:** Add "Favorite" star button for servers.
-   **Robustness:** Validate IP/Port constraints strictly before attempting connection.
-   **Verification:** Restart client and verify recent servers list is populated.

## Prompt 9: Lock Timeouts & Admin Override (Extends 2.x)
**Objective:** Prevent indefinite locking by inactive clients and give Host control.
**Context:** If a client crashes without disconnecting clean or walks away, a field remains locked forever.
**Tasks:**
-   **Electron Main:** Track `lastActivity` timestamp for each lock. Implement a `checkLockExpiry` interval (e.g., 5 mins).
-   **Server Logic:** Auto-release locks after timeout and emit `lock-timeout` event.
-   **Settings UI:** Add "Admin Panel" for Host to view all active locks and "Force Release" specific ones.
-   **Verification:** Test that a lock is auto-released after the configured timeout.

## Prompt 10: Advanced Build Control (Extends 3.1)
**Objective:** Provide meaningful feedback during builds and control over the process.
**Context:** Clients only see "Building..." or "Success". They don't know if it's 10% or 90% done, or if it's stuck.
**Tasks:**
-   **Electron Main:** Stream `stdout`/`stderr` from the build process via `socket.io` to clients ("build-log-chunk").
-   **Settings UI/Header:** Add a "Build Logs" terminal viewer (toggleable).
-   **Feature:** Add "Cancel Build" button for Host (kills the child process).
-   **Verification:** Trigger a build and verify logs stream in real-time to a Client.

## Prompt 11: Security & Authentication (Extends 4 & Safeguards)
**Objective:** Secure the collaboration server against unauthorized access.
**Context:** Currently, anyone on the local network can connect and edit.
**Tasks:**
-   **Settings UI:** Add "Server Password" field when starting Host.
-   **Protocol:** Implement a challenge-response auth handshake or simple token header.
-   **Client UI:** Prompt for password when connecting to a secured server.
-   **Robustness:** Encrypt discovery UDP packets or hide them if "Private Mode" is enabled.
-   **Verification:** Verify a client cannot join without the correct password.

## Prompt 12: Data Integrity & Offline Recovery (Extends 3 & 5)
**Objective:** Prevent data loss during sync conflicts or network interruptions.
**Context:** If a client edits while offline, changes might be lost or overwrite server state blindly upon reconnect.
**Tasks:**
-   **useCMSData:** Implement "Offline Queue" for changes made while disconnected.
-   **Sync Logic:** On reconnect, compare Offline Queue with current Server State.
-   **UI:** Show "Conflict Detected" modal if server state changed while client was offline, allowing "Keep Server" or "Overwrite" choice.
-   **Robustness:** Create a local "Snapshot" backup of `localStorage` before applying any "Full State Verification" from Host.
-   **Verification:** Simulate offline edits, reconnect, and verify conflict resolution flow.

## Prompt 13: Service Mode & Headless Operation (Extends 6)
**Objective:** Run the CMS Server without the full GUI overhead for dedicated hosting.
**Context:** Users may want to run the Host on a Raspberry Pi or server without a display.
**Tasks:**
-   **Electron Main:** Add command-line flag `--headless` or `--server-only`.
-   **Logic:** Skip window creation if flag is present; start `collabServer` immediately.
-   **Feature:** Output a QR code to the terminal for easy mobile connection.
-   **Verification:** Run app with flag and verify clients can still connect and edit.
