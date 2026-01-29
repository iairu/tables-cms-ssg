import Cocoa

class BoxesEditorViewController: NSViewController, ComponentEditor, NSTableViewDataSource, NSTableViewDelegate {

    weak var delegate: ComponentEditorDelegate?
    private var content: BoxesContent?

    private let tableView = NSTableView()

    override func loadView() {
        self.view = NSView(frame: NSRect(x: 0, y: 0, width: 600, height: 400))
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        
        let column = NSTableColumn(identifier: NSUserInterfaceItemIdentifier("column"))
        column.title = "Box Title"
        tableView.addTableColumn(column)
        tableView.dataSource = self
        tableView.delegate = self
        tableView.doubleAction = #selector(editBox)

        let scrollView = NSScrollView()
        scrollView.documentView = tableView
        
        let buttonStack = NSStackView(orientation: .horizontal, NSButton(title: "Add", target: self, action: #selector(addBox)), NSButton(title: "Remove", target: self, action: #selector(removeBox)))
        let saveButton = NSButton(title: "Save", target: self, action: #selector(save))
        
        let mainStack = NSStackView(orientation: .vertical, buttonStack, scrollView, saveButton)
        mainStack.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(mainStack)
        
        NSLayoutConstraint.activate([
            mainStack.topAnchor.constraint(equalTo: view.topAnchor, constant: 20),
            mainStack.bottomAnchor.constraint(equalTo: view.bottomAnchor, constant: -20),
            mainStack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            mainStack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20)
        ])
        
        updateUI()
    }
    
    func setContent<T: ComponentContent>(_ content: T) {
        if let boxesContent = content as? BoxesContent {
            self.content = boxesContent
        }
    }
    
    private func updateUI() {
        tableView.reloadData()
    }
    
    @objc private func save() {
        guard let content = content else { return }
        delegate?.componentEditorDidSave(content: content)
        dismiss(self)
    }
    
    func numberOfRows(in tableView: NSTableView) -> Int {
        return content?.boxes.count ?? 0
    }

    func tableView(_ tableView: NSTableView, viewFor tableColumn: NSTableColumn?, row: Int) -> NSView? {
        let cell = tableView.makeView(withIdentifier: NSUserInterfaceItemIdentifier("cell"), owner: nil) as? NSTextField ?? NSTextField()
        cell.stringValue = content?.boxes[row].title ?? ""
        return cell
    }
    
    @objc private func addBox() {
        let newBox = BoxesContent.Box(title: "New Box", text: "", link: "")
        content?.boxes.append(newBox)
        tableView.reloadData()
    }
    
    @objc private func removeBox() {
        let selectedRow = tableView.selectedRow
        if selectedRow != -1 {
            content?.boxes.remove(at: selectedRow)
            tableView.reloadData()
        }
    }
    
    @objc private func editBox() {
        // Implement editing a box in a sheet
    }
}
