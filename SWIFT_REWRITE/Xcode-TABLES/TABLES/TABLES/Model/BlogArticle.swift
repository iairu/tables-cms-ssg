import Foundation

struct BlogArticle: Codable {
    var id: UUID
    var title: String
    var slug: String
    var date: Date
    var author: String
    var content: String
    var translations: [String: BlogArticleTranslation]?
}

struct BlogArticleTranslation: Codable {
    var title: String
    var content: String
}
