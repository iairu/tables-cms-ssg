import Foundation

struct Reservation: Codable {
    var id: UUID
    var customerID: UUID
    var itemID: UUID
    var startDate: Date
    var endDate: Date
    var quantity: Int
}
