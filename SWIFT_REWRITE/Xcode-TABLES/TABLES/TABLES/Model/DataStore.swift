import Foundation

class DataStore {
    static let shared = DataStore()
    
    var pages: [Page] = []
    var articles: [BlogArticle] = []
    var settings: SiteSettings?
    // Add other data arrays here
    
    private init() {}
    
    func loadAll() {
        pages = DataManager.shared.load("pages.json") ?? []
        articles = DataManager.shared.load("blogArticles.json") ?? []
        settings = DataManager.shared.load("settings.json")
    }
    
    func saveAll() {
        DataManager.shared.save(pages, to: "pages.json")
        DataManager.shared.save(articles, to: "blogArticles.json")
        if let settings = settings {
            DataManager.shared.save(settings, to: "settings.json")
        }
    }
}
