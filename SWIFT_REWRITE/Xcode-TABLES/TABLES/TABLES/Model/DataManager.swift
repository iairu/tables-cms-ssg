import Foundation

class DataManager {

    static let shared = DataManager()

    private var dataDirectoryURL: URL?

    private init() {
        // For now, let's assume a relative path. This should be made configurable.
        // The data is in `main-site/static/data` relative to the project root.
        let projectRoot = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
        dataDirectoryURL = projectRoot.appendingPathComponent("TABLES.app/Contents/Resources/main-site/static/data")
    }
    
    func setDataDirectory(url: URL) {
        self.dataDirectoryURL = url
    }

    func load<T: Decodable>(_ filename: String) -> T? {
        guard let dataDirectoryURL = dataDirectoryURL else {
            print("Error: Data directory not set.")
            return nil
        }
        
        let fileURL = dataDirectoryURL.appendingPathComponent(filename)
        
        do {
            let data = try Data(contentsOf: fileURL)
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            let items = try decoder.decode(T.self, from: data)
            return items
        } catch {
            print("Error loading \(filename): \(error)")
            return nil
        }
    }

    func save<T: Encodable>(_ data: T, to filename: String) {
        guard let dataDirectoryURL = dataDirectoryURL else {
            print("Error: Data directory not set.")
            return
        }
        
        let fileURL = dataDirectoryURL.appendingPathComponent(filename)
        
        do {
            let encoder = JSONEncoder()
            encoder.outputFormatting = .prettyPrinted
            encoder.dateEncodingStrategy = .iso8601
            let data = try encoder.encode(data)
            try data.write(to: fileURL)
        } catch {
            print("Error saving \(filename): \(error)")
        }
    }
}
