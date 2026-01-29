import Foundation

struct Page: Codable {
    var slug: String
    var rows: [PageComponentType]
}
