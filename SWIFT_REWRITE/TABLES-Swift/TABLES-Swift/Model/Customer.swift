import Foundation

struct Customer: Codable {
    var id: UUID
    var name: String
    var email: String?
    var phone: String?
}
