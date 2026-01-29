import Cocoa

class BlogViewController: NSViewController, NSTableViewDataSource, NSTableViewDelegate {

    private let tableView = NSTableView()
    private var articles: [BlogArticle] = []

    override func loadView() {
        self.view = NSView()
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        
        let column = NSTableColumn(identifier: NSUserInterfaceItemIdentifier("column"))
        column.title = "Article Title"
        tableView.addTableColumn(column)
        tableView.dataSource = self
        tableView.delegate = self
        tableView.doubleAction = #selector(editArticle)

        let scrollView = NSScrollView()
        scrollView.documentView = tableView
        scrollView.hasVerticalScroller = true
        
        let addButton = NSButton(title: "Add", target: self, action: #selector(addArticle))
        let removeButton = NSButton(title: "Remove", target: self, action: #selector(removeArticle))
        
        let buttonStack = NSStackView(views: [addButton, removeButton])
        buttonStack.orientation = .horizontal
        
        let mainStack = NSStackView(views: [buttonStack, scrollView])
        mainStack.orientation = .vertical
        
        mainStack.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(mainStack)
        
        NSLayoutConstraint.activate([
            mainStack.topAnchor.constraint(equalTo: view.topAnchor, constant: 20),
            mainStack.bottomAnchor.constraint(equalTo: view.bottomAnchor, constant: -20),
            mainStack.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            mainStack.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20)
        ])
        
        loadArticles()
    }
    
    private func loadArticles() {
        articles = DataStore.shared.articles
        tableView.reloadData()
    }
    
    private func saveArticles() {
        DataStore.shared.articles = articles
        DataStore.shared.saveAll()
    }

    func numberOfRows(in tableView: NSTableView) -> Int {
        return articles.count
    }

    func tableView(_ tableView: NSTableView, viewFor tableColumn: NSTableColumn?, row: Int) -> NSView? {
        let cell = tableView.makeView(withIdentifier: NSUserInterfaceItemIdentifier("cell"), owner: nil) as? NSTextField ?? NSTextField()
        cell.stringValue = articles[row].title
        return cell
    }
    
    @objc private func addArticle() {
        let alert = NSAlert()
        alert.messageText = "Add New Article"
        alert.addButton(withTitle: "Add")
        alert.addButton(withTitle: "Cancel")

        let textField = NSTextField(frame: NSRect(x: 0, y: 0, width: 200, height: 24))
        textField.placeholderString = "Article Title"
        alert.accessoryView = textField

        if alert.runModal() == .alertFirstButtonReturn {
            let title = textField.stringValue
            guard !title.isEmpty else {
                showError(message: "Title cannot be empty.")
                return
            }

            let slug = title.lowercased().replacingOccurrences(of: " ", with: "-")
            guard articles.first(where: { $0.slug == slug }) == nil else {
                showError(message: "An article with this slug already exists.")
                return
            }
            
            let newArticle = BlogArticle(id: UUID(), title: title, slug: slug, date: Date(), author: "Admin", content: "")
            articles.append(newArticle)
            saveArticles()
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
    
    @objc private func removeArticle() {
        let selectedRow = tableView.selectedRow
        if selectedRow != -1 {
            let alert = NSAlert()
            alert.messageText = "Are you sure you want to delete this article?"
            alert.informativeText = "This action cannot be undone."
            alert.addButton(withTitle: "Delete")
            alert.addButton(withTitle: "Cancel")
            
            if alert.runModal() == .alertFirstButtonReturn {
                articles.remove(at: selectedRow)
                saveArticles()
                tableView.reloadData()
            }
        }
    }
    
    @objc private func editArticle() {
        let selectedRow = tableView.selectedRow
        guard selectedRow != -1 else { return }
        
        let article = articles[selectedRow]
        let editorVC = BlogArticleEditorViewController(article: article)
        editorVC.delegate = self
        self.presentAsModalWindow(editorVC)
    }
}

extension BlogViewController: BlogArticleEditorDelegate {
    func articleEditorDidSave(article: BlogArticle) {
        if let index = articles.firstIndex(where: { $0.id == article.id }) {
            articles[index] = article
            saveArticles()
            tableView.reloadData()
        }
    }
}
