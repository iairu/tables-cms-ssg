import Cocoa

class PageEditorViewController: NSViewController, NSTableViewDataSource, NSTableViewDelegate {

    private var page: Page
    weak var delegate: PageEditorDelegate?
    
    private let tableView = NSTableView()
    private let scrollView = NSScrollView()

    init(page: Page) {
        self.page = page
        super.init(nibName: nil, bundle: nil)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func loadView() {
        self.view = NSView(frame: NSRect(x: 0, y: 0, width: 800, height: 600))
    }

    private static let dragDropType = NSPasteboard.PasteboardType(rawValue: "private.row")

    override func viewDidLoad() {
        super.viewDidLoad()
        
        title = "Edit Page: \(page.slug)"
        
        let column = NSTableColumn(identifier: NSUserInterfaceItemIdentifier("column"))
        column.title = "Component Type"
        tableView.addTableColumn(column)
        tableView.dataSource = self
        tableView.delegate = self
        tableView.doubleAction = #selector(editComponent)
        
        scrollView.documentView = tableView
        scrollView.hasVerticalScroller = true
        
        let buttonStack = NSStackView()
        buttonStack.orientation = .horizontal
        let addButton = NSButton(title: "Add Component", target: self, action: #selector(addComponent))
        let removeButton = NSButton(title: "Remove Component", target: self, action: #selector(removeComponent))
        let saveButton = NSButton(title: "Save", target: self, action: #selector(savePage))
        let cancelButton = NSButton(title: "Cancel", target: self, action: #selector(cancel))
        buttonStack.addArrangedSubview(addButton)
        buttonStack.addArrangedSubview(removeButton)
        buttonStack.addArrangedSubview(saveButton)
        buttonStack.addArrangedSubview(cancelButton)

        let mainStack = NSStackView()
        mainStack.orientation = .vertical
        mainStack.addArrangedSubview(buttonStack)
        mainStack.addArrangedSubview(scrollView)
        
        tableView.setDraggingSourceOperationMask(.move, forLocal: true)
        tableView.registerForDraggedTypes([PageEditorViewController.dragDropType])
        
        mainStack.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(mainStack)
        
        NSLayoutConstraint.activate([
            mainStack.topAnchor.constraint(equalTo: view.topAnchor, constant: 20),
            mainStack.bottomAnchor.constraint(equalTo: view.bottomAnchor, constant: -20),
            mainStack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            mainStack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20)
        ])
    }

    // MARK: - NSTableViewDataSource Drag and Drop

    func tableView(_ tableView: NSTableView, pasteboardWriterForRow row: Int) -> NSPasteboardWriting? {
        let item = NSPasteboardItem()
        item.setString(String(row), forType: PageEditorViewController.dragDropType)
        return item
    }

    func tableView(_ tableView: NSTableView, validateDrop info: NSDraggingInfo, proposedRow row: Int, proposedDropOperation dropOperation: NSTableView.DropOperation) -> NSDragOperation {
        if dropOperation == .above {
            return .move
        }
        return []
    }

    func tableView(_ tableView: NSTableView, acceptDrop info: NSDraggingInfo, row: Int, dropOperation: NSTableView.DropOperation) -> Bool {
        guard let items = info.draggingPasteboard.pasteboardItems,
              let pasteboardItem = items.first,
              let originalRowString = pasteboardItem.string(forType: PageEditorViewController.dragDropType),
              let originalRow = Int(originalRowString) else {
            return false
        }

        let movedItem = page.rows.remove(at: originalRow)
        if originalRow < row {
            page.rows.insert(movedItem, at: row - 1)
        } else {
            page.rows.insert(movedItem, at: row)
        }
        
        tableView.reloadData()
        
        return true
    }



    func numberOfRows(in tableView: NSTableView) -> Int {
        return page.rows.count
    }
    
    func tableView(_ tableView: NSTableView, viewFor tableColumn: NSTableColumn?, row: Int) -> NSView? {
        let cellIdentifier = NSUserInterfaceItemIdentifier("cell")
        var cell = tableView.makeView(withIdentifier: cellIdentifier, owner: nil) as? NSTextField
        if cell == nil {
            cell = NSTextField(labelWithString: "")
            cell?.identifier = cellIdentifier
        }
        
        let component = page.rows[row]
        switch component {
        case .titleSlide:
            cell?.stringValue = "Title Slide"
        case .boxes:
            cell?.stringValue = "Boxes"
        }
        
        return cell
    }
    
    @objc private func addComponent() {
        let alert = NSAlert()
        alert.messageText = "Add New Component"
        alert.addButton(withTitle: "Add")
        alert.addButton(withTitle: "Cancel")
        
        let popUp = NSPopUpButton(frame: NSRect(x: 0, y: 0, width: 200, height: 24))
        popUp.addItems(withTitles: ["Title Slide", "Boxes"])
        alert.accessoryView = popUp
        
        if alert.runModal() == .alertFirstButtonReturn {
            let selectedType = popUp.titleOfSelectedItem
            let newComponent: PageComponentType
            
            switch selectedType {
            case "Title Slide":
                newComponent = .titleSlide(TitleSlideContent(title: "New Title Slide"))
            case "Boxes":
                newComponent = .boxes(BoxesContent(boxes: []))
            default:
                return
            }
            
            page.rows.append(newComponent)
            tableView.reloadData()
        }
    }
    
    @objc private func removeComponent() {
        let selectedRow = tableView.selectedRow
        guard selectedRow != -1 else { return }

        let alert = NSAlert()
        alert.messageText = "Are you sure you want to remove this component?"
        alert.informativeText = "This action cannot be undone."
        alert.addButton(withTitle: "Remove")
        alert.addButton(withTitle: "Cancel")

        if alert.runModal() == .alertFirstButtonReturn {
            page.rows.remove(at: selectedRow)
            tableView.reloadData()
        }
    }
    
    @objc private func editComponent() {
        let selectedRow = tableView.selectedRow
        guard selectedRow != -1 else { return }
        
        let component = page.rows[selectedRow]
        let editor: ComponentEditor
        
        switch component {
        case .titleSlide(let content):
            let titleSlideEditor = TitleSlideEditorViewController()
            titleSlideEditor.setContent(content)
            editor = titleSlideEditor
        case .boxes(let content):
            let boxesEditor = BoxesEditorViewController()
            boxesEditor.setContent(content)
            editor = boxesEditor
        }
        
        editor.delegate = self
        guard let viewController = editor as? NSViewController else {
            fatalError("Editor must be a NSViewController")
        }
        // Replaced presentAsModalWindow with presentAsSheet to resolve build error.
        self.presentAsSheet(viewController)
    }
    
    @objc private func savePage() {
        delegate?.pageEditorDidSave(page: page)
        dismiss(self)
    }
    
    @objc private func cancel() {
        dismiss(self)
    }
}

extension PageEditorViewController: ComponentEditorDelegate {
    func componentEditorDidSave<T>(content: T) where T : ComponentContent {
        let selectedRow = tableView.selectedRow
        guard selectedRow != -1 else { return }

        if let titleSlideContent = content as? TitleSlideContent {
            page.rows[selectedRow] = .titleSlide(titleSlideContent)
        } else if let boxesContent = content as? BoxesContent {
            page.rows[selectedRow] = .boxes(boxesContent)
        }
        
        tableView.reloadData()
    }
}
