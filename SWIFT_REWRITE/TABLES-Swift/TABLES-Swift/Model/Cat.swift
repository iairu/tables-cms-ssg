import Foundation

struct Cat: Codable {
    var id: UUID
    var name: String
    var birthDate: Date?
    var sireID: UUID?
    var damID: UUID?
    var description: String?
    var image: String? // Path to image
}
