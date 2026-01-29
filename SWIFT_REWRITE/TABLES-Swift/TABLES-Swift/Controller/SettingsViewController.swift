import Cocoa

class SettingsViewController: NSViewController {

    private var siteNameTextField: NSTextField!
    private var defaultLanguageTextField: NSTextField!
    private var languagesTextField: NSTextField!
    
    private var settings: SiteSettings?

    override func loadView() {
        self.view = NSView()
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        self.view.wantsLayer = true
        
        let stackView = NSStackView()
        stackView.orientation = .vertical
        stackView.alignment = .leading
        stackView.spacing = 10
        stackView.translatesAutoresizingMaskIntoConstraints = false
        
        let siteNameLabel = NSTextField(labelWithString: "Site Name:")
        siteNameTextField = NSTextField()
        
        let defaultLanguageLabel = NSTextField(labelWithString: "Default Language:")
        defaultLanguageTextField = NSTextField()

        let languagesLabel = NSTextField(labelWithString: "Languages (comma-separated):")
        languagesTextField = NSTextField()

        stackView.addArrangedSubview(siteNameLabel)
        stackView.addArrangedSubview(siteNameTextField)
        stackView.addArrangedSubview(defaultLanguageLabel)
        stackView.addArrangedSubview(defaultLanguageTextField)
        stackView.addArrangedSubview(languagesLabel)
        stackView.addArrangedSubview(languagesTextField)
        
        let saveButton = NSButton(title: "Save", target: self, action: #selector(saveSettings))
        stackView.addArrangedSubview(saveButton)
        
        view.addSubview(stackView)
        
        NSLayoutConstraint.activate([
            stackView.topAnchor.constraint(equalTo: view.topAnchor, constant: 20),
            stackView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            stackView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            siteNameTextField.widthAnchor.constraint(equalToConstant: 200),
            defaultLanguageTextField.widthAnchor.constraint(equalToConstant: 200),
            languagesTextField.widthAnchor.constraint(equalToConstant: 200)
        ])
        
        loadSettings()
    }
    
    private func loadSettings() {
        settings = DataStore.shared.settings
        if let settings = settings {
            siteNameTextField.stringValue = settings.siteName
            defaultLanguageTextField.stringValue = settings.defaultLanguage
            languagesTextField.stringValue = settings.languages.joined(separator: ",")
        } else {
            // Create default settings if none exist
            let defaultSettings = SiteSettings(siteName: "My Site", defaultLanguage: "en", languages: ["en"], theme: "default", vercel: nil)
            settings = defaultSettings
            DataStore.shared.settings = defaultSettings
            siteNameTextField.stringValue = defaultSettings.siteName
            defaultLanguageTextField.stringValue = defaultSettings.defaultLanguage
            languagesTextField.stringValue = defaultSettings.languages.joined(separator: ",")
        }
    }
    
    @objc private func saveSettings() {
        guard var settings = settings else { return }
        settings.siteName = siteNameTextField.stringValue
        settings.defaultLanguage = defaultLanguageTextField.stringValue
        settings.languages = languagesTextField.stringValue.split(separator: ",").map { String($0).trimmingCharacters(in: .whitespaces) }
        DataStore.shared.settings = settings
        DataStore.shared.saveAll()
        
        let alert = NSAlert()
        alert.messageText = "Settings Saved"
        alert.runModal()
    }
}
