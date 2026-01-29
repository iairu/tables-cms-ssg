import Foundation

struct SiteSettings: Codable {
    var siteName: String
    var defaultLanguage: String
    var languages: [String]
    var theme: String
    var vercel: VercelSettings?
}

struct VercelSettings: Codable {
    var project: String
    var team: String?
    var token: String
}
