import Cocoa

class MainViewController: NSViewController, SidebarViewControllerDelegate {

    private let splitViewController = NSSplitViewController()
    private let sidebarViewController = SidebarViewController()
    private let contentViewController = NSViewController()

    override func loadView() {
        self.view = NSView()
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        
        sidebarViewController.delegate = self

        // Setup sidebar
        let sidebarItem = NSSplitViewItem(sidebarWithViewController: sidebarViewController)
        // Prevent the sidebar from being resized by the user or window resizing.
        sidebarItem.holdingPriority = .defaultHigh
        splitViewController.addSplitViewItem(sidebarItem)

        // Setup content
        contentViewController.view = NSView()
        contentViewController.view.wantsLayer = true
        contentViewController.view.layer?.backgroundColor = NSColor.windowBackgroundColor.cgColor
        let contentItem = NSSplitViewItem(viewController: contentViewController)
        splitViewController.addSplitViewItem(contentItem)

        // Add split view to the main view
        self.addChild(splitViewController)
        self.view.addSubview(splitViewController.view)
        
        let buildButton = NSButton(title: "Build", target: self, action: #selector(runBuild))
        let deployButton = NSButton(title: "Deploy", target: self, action: #selector(runDeploy))
        
        let buttonStack = NSStackView(views: [buildButton, deployButton])
        buttonStack.translatesAutoresizingMaskIntoConstraints = false
        self.view.addSubview(buttonStack)
        
        splitViewController.view.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            splitViewController.view.topAnchor.constraint(equalTo: self.view.topAnchor),
            splitViewController.view.bottomAnchor.constraint(equalTo: self.view.bottomAnchor),
            splitViewController.view.leadingAnchor.constraint(equalTo: self.view.leadingAnchor),
            splitViewController.view.trailingAnchor.constraint(equalTo: self.view.trailingAnchor),
            
            buttonStack.topAnchor.constraint(equalTo: self.view.topAnchor, constant: 10),
            buttonStack.trailingAnchor.constraint(equalTo: self.view.trailingAnchor, constant: -10)
        ])
        
        // Initial content
        sidebarDidSelectItem(at: 0)
    }
    
    private var viewControllers: [String: NSViewController] = [:]
    
    @objc private func runBuild() {
        let buildButton = self.view.subviews.first(where: { $0 is NSButton }) as? NSButton
        buildButton?.isEnabled = false

        BuildManager.shared.runBuild { [weak self] success, output in
            DispatchQueue.main.async {
                buildButton?.isEnabled = true
                let alert = NSAlert()
                alert.messageText = success ? "Build Successful" : "Build Failed"
                alert.informativeText = success ? "The website has been built successfully." : "The build process failed. Please check the build output for more details."
                alert.runModal()
            }
        }
    }

    @objc private func runDeploy() {
        let deployButton = (self.view.subviews.first(where: { $0 is NSStackView }) as? NSStackView)?.subviews.last as? NSButton
        deployButton?.isEnabled = false

        BuildManager.shared.runDeploy { [weak self] success, output in
            DispatchQueue.main.async {
                deployButton?.isEnabled = true
                let alert = NSAlert()
                alert.messageText = success ? "Deploy Successful" : "Deploy Failed"
                alert.informativeText = success ? "The website has been deployed successfully." : "The deploy process failed. Please check the deploy output for more details."
                alert.runModal()
            }
        }
    }

    func sidebarDidSelectItem(at index: Int) {
        let identifier: String
        
        switch index {
        case 1:
            identifier = "Pages"
        case 2:
            identifier = "Blog"
        case 3:
            identifier = "Settings"
        default:
            identifier = "Dashboard"
        }
        
        // Hide the current view controller
        if let currentViewController = contentViewController.children.first {
            currentViewController.view.isHidden = true
        }

        // Show the new view controller
        if let newViewController = viewControllers[identifier] {
            newViewController.view.isHidden = false
        } else {
            let newViewController: NSViewController
            switch identifier {
            case "Pages":
                newViewController = PagesViewController()
            case "Blog":
                newViewController = BlogViewController()
            case "Settings":
                newViewController = SettingsViewController()
            default:
                let vc = NSViewController()
                vc.view = NSView()
                let label = NSTextField(labelWithString: "Welcome to TABLES (Swift Edition)")
                label.translatesAutoresizingMaskIntoConstraints = false
                vc.view.addSubview(label)
                NSLayoutConstraint.activate([
                    label.centerXAnchor.constraint(equalTo: vc.view.centerXAnchor),
                    label.centerYAnchor.constraint(equalTo: vc.view.centerYAnchor)
                ])
                newViewController = vc
            }
            
            viewControllers[identifier] = newViewController
            
            contentViewController.addChild(newViewController)
            contentViewController.view.addSubview(newViewController.view)
            newViewController.view.translatesAutoresizingMaskIntoConstraints = false
            NSLayoutConstraint.activate([
                newViewController.view.topAnchor.constraint(equalTo: contentViewController.view.topAnchor),
                newViewController.view.bottomAnchor.constraint(equalTo: contentViewController.view.bottomAnchor),
                newViewController.view.leadingAnchor.constraint(equalTo: contentViewController.view.leadingAnchor),
                newViewController.view.trailingAnchor.constraint(equalTo: contentViewController.view.trailingAnchor)
            ])
        }
    }
    

}
