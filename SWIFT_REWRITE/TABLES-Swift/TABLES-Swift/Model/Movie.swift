import Foundation

struct Movie: Codable {
    var id: UUID
    var imdbID: String
    var title: String
    var year: Int
    var rating: Double? // User's rating
    var watched: Bool
}
