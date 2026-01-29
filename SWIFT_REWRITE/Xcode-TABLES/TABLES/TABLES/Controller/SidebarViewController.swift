import Cocoa

protocol SidebarViewControllerDelegate: AnyObject {
    func sidebarDidSelectItem(at index: Int)
}

class SidebarViewController: NSViewController, NSTableViewDataSource, NSTableViewDelegate {

    private let tableView = NSTableView()
    private let scrollView = NSScrollView()
    
    weak var delegate: SidebarViewControllerDelegate?
    
    private let items = ["Dashboard", "Pages", "Blog", "Settings"]

    override func loadView() {
        self.view = NSView()
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        tableView.headerView = nil
        let column = NSTableColumn(identifier: NSUserInterfaceItemIdentifier("column"))
        tableView.addTableColumn(column)
        tableView.dataSource = self
        tableView.delegate = self
        
        scrollView.documentView = tableView
        scrollView.hasVerticalScroller = true
        
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(scrollView)
        
        NSLayoutConstraint.activate([
            scrollView.topAnchor.constraint(equalTo: view.topAnchor),
            scrollView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            scrollView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            scrollView.trailingAnchor.constraint(equalTo: view.trailingAnchor)
        ])
    }
    
    func numberOfRows(in tableView: NSTableView) -> Int {
        return items.count
    }
    
    func tableView(_ tableView: NSTableView, viewFor tableColumn: NSTableColumn?, row: Int) -> NSView? {
        let cellIdentifier = NSUserInterfaceItemIdentifier("cell")
        var cell = tableView.makeView(withIdentifier: cellIdentifier, owner: nil) as? NSTextField
        if cell == nil {
            cell = NSTextField(labelWithString: items[row])
            cell?.identifier = cellIdentifier
            cell?.isBezeled = false
            cell?.isEditable = false
            cell?.drawsBackground = false
        }
        cell?.stringValue = items[row]
        return cell
    }
    
    func tableViewSelectionDidChange(_ notification: Notification) {
        delegate?.sidebarDidSelectItem(at: tableView.selectedRow)
    }
}
