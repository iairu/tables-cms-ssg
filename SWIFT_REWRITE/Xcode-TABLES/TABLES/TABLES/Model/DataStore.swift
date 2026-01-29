import Foundation

class DataStore {
    static let shared = DataStore()
    
    var pages: [Page] = []
    var articles: [BlogArticle] = []
    var settings: SiteSettings?
    var catRows: [Cat] = []
    var inventory: [InventoryItem] = []
    var reservations: [Reservation] = []
    var movies: [Movie] = []
    // Add other data arrays here
    
    private init() {}
    
    func loadAll() {
        pages = DataManager.shared.load("pages.json") ?? []
        articles = DataManager.shared.load("blogArticles.json") ?? []
        settings = DataManager.shared.load("settings.json")
        catRows = DataManager.shared.load("catRows.json") ?? []
        inventory = DataManager.shared.load("inventory.json") ?? []
        reservations = DataManager.shared.load("reservations.json") ?? []
        movies = DataManager.shared.load("movieList.json") ?? []
    }
    
    func saveAll() {
        DataManager.shared.save(pages, to: "pages.json")
        DataManager.shared.save(articles, to: "blogArticles.json")
        if let settings = settings {
            DataManager.shared.save(settings, to: "settings.json")
        }
        DataManager.shared.save(catRows, to: "catRows.json")
        DataManager.shared.save(inventory, to: "inventory.json")
        DataManager.shared.save(reservations, to: "reservations.json")
        DataManager.shared.save(movies, to: "movieList.json")
    }
}
