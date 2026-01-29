import Cocoa

class TitleSlideEditorViewController: NSViewController, ComponentEditor {

    weak var delegate: ComponentEditorDelegate?
    private var content: TitleSlideContent?

    private var titleField: NSTextField!
    private var subtitleField: NSTextField!
    private var backgroundField: NSTextField!

    override func loadView() {
        self.view = NSView(frame: NSRect(x: 0, y: 0, width: 400, height: 300))
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        
        let stackView = NSStackView()
        stackView.orientation = .vertical
        stackView.alignment = .leading
        stackView.spacing = 10
        stackView.translatesAutoresizingMaskIntoConstraints = false

        titleField = NSTextField()
        subtitleField = NSTextField()
        backgroundField = NSTextField()

        stackView.addArrangedSubview(NSTextField(labelWithString: "Title:"))
        stackView.addArrangedSubview(titleField)
        stackView.addArrangedSubview(NSTextField(labelWithString: "Subtitle:"))
        stackView.addArrangedSubview(subtitleField)
        stackView.addArrangedSubview(NSTextField(labelWithString: "Background Image Path:"))
        stackView.addArrangedSubview(backgroundField)
        
        let saveButton = NSButton(title: "Save", target: self, action: #selector(save))
        stackView.addArrangedSubview(saveButton)

        view.addSubview(stackView)
        
        NSLayoutConstraint.activate([
            stackView.topAnchor.constraint(equalTo: view.topAnchor, constant: 20),
            stackView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            stackView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            titleField.widthAnchor.constraint(equalToConstant: 200),
            subtitleField.widthAnchor.constraint(equalToConstant: 200),
            backgroundField.widthAnchor.constraint(equalToConstant: 200),
        ])
        
        updateUI()
    }
    
    func setContent<T: ComponentContent>(_ content: T) {
        if let titleSlideContent = content as? TitleSlideContent {
            self.content = titleSlideContent
        }
    }
    
    private func updateUI() {
        guard let content = content else { return }
        titleField.stringValue = content.title
        subtitleField.stringValue = content.subtitle ?? ""
        backgroundField.stringValue = content.backgroundImage ?? ""
    }
    
    @objc private func save() {
        guard var content = content else { return }
        content.title = titleField.stringValue
        content.subtitle = subtitleField.stringValue
        content.backgroundImage = backgroundField.stringValue
        delegate?.componentEditorDidSave(content: content)
        dismiss(self)
    }
}
