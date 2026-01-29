import Cocoa

class SettingsViewController: NSViewController {

    private var siteNameTextField: NSTextField!
    private var defaultLanguageTextField: NSTextField!
    private var languagesTextField: NSTextField!
    private var themeTextField: NSTextField!
    private var vercelProjectTextField: NSTextField!
    private var vercelTeamTextField: NSTextField!
    private var vercelTokenTextField: NSSecureTextField!
    
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
        
        siteNameTextField = createTextField(label: "Site Name:")
        defaultLanguageTextField = createTextField(label: "Default Language:")
        languagesTextField = createTextField(label: "Languages (comma-separated):")
        themeTextField = createTextField(label: "Theme:")
        vercelProjectTextField = createTextField(label: "Vercel Project:")
        vercelTeamTextField = createTextField(label: "Vercel Team:")
        vercelTokenTextField = createSecureTextField(label: "Vercel Token:")

        stackView.addArrangedSubview(createLabel(text: "Site Name:"))
        stackView.addArrangedSubview(siteNameTextField)
        stackView.addArrangedSubview(createLabel(text: "Default Language:"))
        stackView.addArrangedSubview(defaultLanguageTextField)
        stackView.addArrangedSubview(createLabel(text: "Languages (comma-separated):"))
        stackView.addArrangedSubview(languagesTextField)
        stackView.addArrangedSubview(createLabel(text: "Theme:"))
        stackView.addArrangedSubview(themeTextField)
        stackView.addArrangedSubview(createLabel(text: "Vercel Project:"))
        stackView.addArrangedSubview(vercelProjectTextField)
        stackView.addArrangedSubview(createLabel(text: "Vercel Team:"))
        stackView.addArrangedSubview(vercelTeamTextField)
        stackView.addArrangedSubview(createLabel(text: "Vercel Token:"))
        stackView.addArrangedSubview(vercelTokenTextField)
        
        let saveButton = NSButton(title: "Save", target: self, action: #selector(saveSettings))
        stackView.addArrangedSubview(saveButton)
        
        view.addSubview(stackView)
        
        NSLayoutConstraint.activate([
            stackView.topAnchor.constraint(equalTo: view.topAnchor, constant: 20),
            stackView.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            stackView.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
        ])
    }

    override func viewWillAppear() {
        super.viewWillAppear()
        loadSettings()
    }
    
    private func createLabel(text: String) -> NSTextField {
        let label = NSTextField(labelWithString: text)
        return label
    }
    
    private func createTextField(label: String) -> NSTextField {
        let textField = NSTextField()
        textField.widthAnchor.constraint(equalToConstant: 250).isActive = true
        return textField
    }

    private func createSecureTextField(label: String) -> NSSecureTextField {
        let textField = NSSecureTextField()
        textField.widthAnchor.constraint(equalToConstant: 250).isActive = true
        return textField
    }

    private func loadSettings() {
        settings = DataStore.shared.settings
        if let settings = settings {
            siteNameTextField.stringValue = settings.siteName
            defaultLanguageTextField.stringValue = settings.defaultLanguage
            languagesTextField.stringValue = settings.languages.joined(separator: ",")
            themeTextField.stringValue = settings.theme
            vercelProjectTextField.stringValue = settings.vercel?.project ?? ""
            vercelTeamTextField.stringValue = settings.vercel?.team ?? ""
            vercelTokenTextField.stringValue = settings.vercel?.token ?? ""
        } else {
            // Create default settings if none exist
            let defaultSettings = SiteSettings(siteName: "My Site", defaultLanguage: "en", languages: ["en"], theme: "default", vercel: VercelSettings(project: "", team: "", token: ""))
            settings = defaultSettings
            DataStore.shared.settings = defaultSettings
            DataStore.shared.saveAll()
            loadSettings() // Recurse to load the newly created settings
        }
    }
    
    @objc private func saveSettings() {
        guard var settings = settings else { return }
        settings.siteName = siteNameTextField.stringValue
        settings.defaultLanguage = defaultLanguageTextField.stringValue
        settings.languages = languagesTextField.stringValue.split(separator: ",").map { String($0).trimmingCharacters(in: .whitespaces) }
        settings.theme = themeTextField.stringValue
        
        let vercelProject = vercelProjectTextField.stringValue
        let vercelTeam = vercelTeamTextField.stringValue
        let vercelToken = vercelTokenTextField.stringValue
        
        if !vercelProject.isEmpty && !vercelToken.isEmpty {
            settings.vercel = VercelSettings(project: vercelProject, team: vercelTeam, token: vercelToken)
        } else {
            settings.vercel = nil
        }
        
        DataStore.shared.settings = settings
        DataStore.shared.saveAll()
        
        let alert = NSAlert()
        alert.messageText = "Settings Saved"
        alert.runModal()
    }
}
