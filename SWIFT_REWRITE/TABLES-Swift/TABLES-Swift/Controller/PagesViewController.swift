import Cocoa

class PagesViewController: NSViewController, NSTableViewDataSource, NSTableViewDelegate {

    private let tableView = NSTableView()
    private let scrollView = NSScrollView()
    private var pages: [Page] = []

    override func loadView() {
        self.view = NSView()
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        
        let column = NSTableColumn(identifier: NSUserInterfaceItemIdentifier("column"))
        column.title = "Page Slug"
        tableView.addTableColumn(column)
        tableView.dataSource = self
        tableView.delegate = self
        
        scrollView.documentView = tableView
        scrollView.hasVerticalScroller = true
        
        let buttonStack = NSStackView()
        buttonStack.orientation = .horizontal
        let addButton = NSButton(title: "Add", target: self, action: #selector(addPage))
        let removeButton = NSButton(title: "Remove", target: self, action: #selector(removePage))
        buttonStack.addArrangedSubview(addButton)
        buttonStack.addArrangedSubview(removeButton)

        let mainStack = NSStackView()
        mainStack.orientation = .vertical
        mainStack.addArrangedSubview(buttonStack)
        mainStack.addArrangedSubview(scrollView)
        
        mainStack.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(mainStack)
        
        NSLayoutConstraint.activate([
            mainStack.topAnchor.constraint(equalTo: view.topAnchor, constant: 20),
            mainStack.bottomAnchor.constraint(equalTo: view.bottomAnchor, constant: -20),
            mainStack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            mainStack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20)
        ])
        
        tableView.doubleAction = #selector(openPageEditor)
        
        loadPages()
    }
    
    private func loadPages() {
        pages = DataStore.shared.pages
        tableView.reloadData()
    }
    
    private func savePages() {
        DataStore.shared.pages = pages
        DataStore.shared.saveAll()
    }

    func numberOfRows(in tableView: NSTableView) -> Int {
        return pages.count
    }
    
    func tableView(_ tableView: NSTableView, viewFor tableColumn: NSTableColumn?, row: Int) -> NSView? {
        let cellIdentifier = NSUserInterfaceItemIdentifier("cell")
        var cell = tableView.makeView(withIdentifier: cellIdentifier, owner: nil) as? NSTextField
        if cell == nil {
            cell = NSTextField(labelWithString: "")
            cell?.identifier = cellIdentifier
            cell?.isBezeled = false
            cell?.isEditable = false
            cell?.drawsBackground = false
        }
        cell?.stringValue = pages[row].slug
        return cell
    }
    
    @objc private func addPage() {
        let alert = NSAlert()
        alert.messageText = "Add New Page"
        alert.addButton(withTitle: "Add")
        alert.addButton(withTitle: "Cancel")

        let textField = NSTextField(frame: NSRect(x: 0, y: 0, width: 200, height: 24))
        textField.placeholderString = "Page Slug"
        alert.accessoryView = textField

        if alert.runModal() == .alertFirstButtonReturn {
            let slug = textField.stringValue

            // Validation
            guard !slug.isEmpty else {
                showError(message: "Slug cannot be empty.")
                return
            }
            guard pages.first(where: { $0.slug == slug }) == nil else {
                showError(message: "Slug must be unique.")
                return
            }
            let slugRegex = "^[a-z0-9-]+$"
            let slugTest = NSPredicate(format:"SELF MATCHES %@", slugRegex)
            guard slugTest.evaluate(with: slug) else {
                showError(message: "Slug can only contain lowercase letters, numbers and hyphens.")
                return
            }

            let newPage = Page(slug: slug, rows: [])
            pages.append(newPage)
            savePages()
            tableView.reloadData()
        }
    }

    private func showError(message: String) {
        let alert = NSAlert()
        alert.messageText = "Error"
        alert.informativeText = message
        alert.alertStyle = .warning
        alert.addButton(withTitle: "OK")
        alert.runModal()
    }
    
    @objc private func removePage() {
        let selectedRow = tableView.selectedRow
        if selectedRow != -1 {
            let alert = NSAlert()
            alert.messageText = "Are you sure you want to delete this page?"
            alert.informativeText = "This action cannot be undone."
            alert.addButton(withTitle: "Delete")
            alert.addButton(withTitle: "Cancel")
            
            if alert.runModal() == .alertFirstButtonReturn {
                pages.remove(at: selectedRow)
                savePages()
                tableView.reloadData()
            }
        }
    }
    
    @objc private func openPageEditor() {
        let selectedRow = tableView.selectedRow
        guard selectedRow != -1 else { return }
        
        let page = pages[selectedRow]
        let editorVC = PageEditorViewController(page: page)
        editorVC.delegate = self
        self.presentAsModalWindow(editorVC)
    }
}

extension PagesViewController: PageEditorDelegate {
    func pageEditorDidSave(page: Page) {
        if let index = pages.firstIndex(where: { $0.slug == page.slug }) {
            pages[index] = page
            savePages()
            tableView.reloadData()
        }
    }
}

