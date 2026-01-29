import Foundation
import Cocoa

class BuildManager {
    static let shared = BuildManager()
    
    private init() {}
    
    func runBuild(completion: @escaping (Bool, String) -> Void) {
        // 1. Get main-site path
        guard let mainSiteURL = Bundle.main.url(forResource: "main-site", withExtension: nil) else {
            completion(false, "Could not find main-site directory.")
            return
        }
        let dataURL = mainSiteURL.appendingPathComponent("src/data")

        // 2. Generate and save data
        do {
            try generateAndSaveData(to: dataURL)
        } catch {
            completion(false, "Error generating data: \(error)")
            return
        }

        // 3. Run gatsby build
        let task = Process()
        let pipe = Pipe()
        
        task.standardOutput = pipe
        task.standardError = pipe
        task.arguments = ["-c", "npm run build"]
        task.executableURL = URL(fileURLWithPath: "/bin/zsh") // or /bin/bash
        task.currentDirectoryURL = mainSiteURL
        
        task.terminationHandler = { process in
            let data = pipe.fileHandleForReading.readDataToEndOfFile()
            let output = String(data: data, encoding: .utf8) ?? ""
            DispatchQueue.main.async {
                self.showBuildOutput(output)
            }
            completion(process.terminationStatus == 0, output)
        }
        
        do {
            try task.run()
        } catch {
            completion(false, "Error running build command: \(error)")
        }
    }

    private func generateAndSaveData(to url: URL) throws {
        let encoder = JSONEncoder()
        encoder.outputFormatting = .prettyPrinted

        // Save pages
        let pagesData = try encoder.encode(DataStore.shared.pages)
        try pagesData.write(to: url.appendingPathComponent("pages.json"))
        
        // Save articles
        let articlesData = try encoder.encode(DataStore.shared.articles)
        try articlesData.write(to: url.appendingPathComponent("articles.json"))

        // Save settings
        let settingsData = try encoder.encode(DataStore.shared.settings)
        try settingsData.write(to: url.appendingPathComponent("settings.json"))
    }
    
    private func showBuildOutput(_ output: String) {
        let outputWindow = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 800, height: 600),
            styleMask: [.miniaturizable, .closable, .resizable, .titled],
            backing: .buffered, defer: false)
        outputWindow.center()
        outputWindow.title = "Build Output"
        
        let scrollView = NSScrollView()
        let textView = NSTextView()
        textView.isEditable = false
        textView.string = output
        scrollView.documentView = textView
        
        outputWindow.contentView = scrollView
        outputWindow.makeKeyAndOrderFront(nil)
    }

    func runDeploy(completion: @escaping (Bool, String) -> Void) {
        // 1. Get main-site path
        guard let mainSiteURL = Bundle.main.url(forResource: "main-site", withExtension: nil) else {
            completion(false, "Could not find main-site directory.")
            return
        }

        // 2. Run vercel deploy
        let task = Process()
        let pipe = Pipe()
        
        task.standardOutput = pipe
        task.standardError = pipe
        task.arguments = ["-c", "vercel deploy --prebuilt"]
        task.executableURL = URL(fileURLWithPath: "/bin/zsh") // or /bin/bash
        task.currentDirectoryURL = mainSiteURL
        
        task.terminationHandler = { process in
            let data = pipe.fileHandleForReading.readDataToEndOfFile()
            let output = String(data: data, encoding: .utf8) ?? ""
            DispatchQueue.main.async {
                self.showDeployOutput(output)
            }
            completion(process.terminationStatus == 0, output)
        }
        
        do {
            try task.run()
        } catch {
            completion(false, "Error running deploy command: \(error)")
        }
    }

    private func showDeployOutput(_ output: String) {
        let outputWindow = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 800, height: 600),
            styleMask: [.miniaturizable, .closable, .resizable, .titled],
            backing: .buffered, defer: false)
        outputWindow.center()
        outputWindow.title = "Deploy Output"
        
        let scrollView = NSScrollView()
        let textView = NSTextView()
        textView.isEditable = false
        textView.string = output
        scrollView.documentView = textView
        
        outputWindow.contentView = scrollView
        outputWindow.makeKeyAndOrderFront(nil)
    }
}
