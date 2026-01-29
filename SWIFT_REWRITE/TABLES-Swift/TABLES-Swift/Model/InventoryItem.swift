import Foundation

struct InventoryItem: Codable {
    var id: UUID
    var name: String
    var description: String?
    var quantity: Int
    var price: Double // Assuming a rental price
}
