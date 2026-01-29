import Cocoa

class BlogArticleEditorViewController: NSViewController {

    weak var delegate: BlogArticleEditorDelegate?
    private var article: BlogArticle

    private var titleField: NSTextField!
    private var slugField: NSTextField!
    private var authorField: NSTextField!
    private var contentTextView: NSTextView!

    init(article: BlogArticle) {
        self.article = article
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func loadView() {
        self.view = NSView(frame: NSRect(x: 0, y: 0, width: 600, height: 400))
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        
        let stackView = NSStackView()
        stackView.orientation = .vertical
        stackView.alignment = .leading

        titleField = NSTextField()
        slugField = NSTextField()
        authorField = NSTextField()
        contentTextView = NSTextView()
        
        let scrollView = NSScrollView()
        scrollView.documentView = contentTextView
        
        stackView.addArrangedSubview(NSTextField(labelWithString: "Title:"))
        stackView.addArrangedSubview(titleField)
        stackView.addArrangedSubview(NSTextField(labelWithString: "Slug:"))
        stackView.addArrangedSubview(slugField)
        stackView.addArrangedSubview(NSTextField(labelWithString: "Author:"))
        stackView.addArrangedSubview(authorField)
        stackView.addArrangedSubview(NSTextField(labelWithString: "Content:"))
        stackView.addArrangedSubview(scrollView)
        
        let saveButton = NSButton(title: "Save", target: self, action: #selector(save))
        stackView.addArrangedSubview(saveButton)

        stackView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(stackView)
        
        NSLayoutConstraint.activate([
            stackView.topAnchor.constraint(equalTo: view.topAnchor, constant: 20),
            stackView.bottomAnchor.constraint(equalTo: view.bottomAnchor, constant: -20),
            stackView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            stackView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            titleField.widthAnchor.constraint(equalToConstant: 300),
            slugField.widthAnchor.constraint(equalToConstant: 300),
            authorField.widthAnchor.constraint(equalToConstant: 300)
        ])
        
        updateUI()
    }
    
    private func updateUI() {
        titleField.stringValue = article.title
        slugField.stringValue = article.slug
        authorField.stringValue = article.author
        contentTextView.string = article.content
    }
    
    @objc private func save() {
        article.title = titleField.stringValue
        article.slug = slugField.stringValue
        article.author = authorField.stringValue
        article.content = contentTextView.string
        delegate?.articleEditorDidSave(article: article)
        dismiss(self)
    }
}
