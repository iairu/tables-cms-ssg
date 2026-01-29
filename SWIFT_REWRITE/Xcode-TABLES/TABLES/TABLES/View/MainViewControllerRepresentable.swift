import SwiftUI
import AppKit

struct MainViewControllerRepresentable: NSViewControllerRepresentable {
    typealias NSViewControllerType = MainViewController

    func makeNSViewController(context: Context) -> MainViewController {
        return MainViewController()
    }

    func updateNSViewController(_ nsViewController: MainViewController, context: Context) {
        // Updates the view controller when SwiftUI state changes.
        // We don't have any state changes to push down yet.
    }
}