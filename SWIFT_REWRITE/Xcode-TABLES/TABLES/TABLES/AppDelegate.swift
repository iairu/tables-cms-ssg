import Cocoa

class AppDelegate: NSObject, NSApplicationDelegate {

    private var window: NSWindow!

    func applicationDidFinishLaunching(_ aNotification: Notification) {
        // Load all data
        DataStore.shared.loadAll()

        // Create the window
        window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 1280, height: 720),
            styleMask: [.miniaturizable, .closable, .resizable, .titled],
            backing: .buffered,
            defer: false
        )
        window.center()
        window.title = "TABLES"
        
        // Create the main content view
        let mainViewController = MainViewController()
        window.contentViewController = mainViewController

        window.makeKeyAndOrderFront(nil)
    }

    func applicationWillTerminate(_ aNotification: Notification) {
        // Insert code here to tear down your application
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }
}
