import Foundation

// A protocol for all component content structs
protocol ComponentContent: Codable {}

struct TitleSlideContent: ComponentContent {
    var title: String
    var subtitle: String?
    var backgroundImage: String?
}

struct BoxesContent: ComponentContent {
    struct Box: Codable {
        var title: String
        var text: String
        var link: String?
    }
    var boxes: [Box]
}

// Add other component content structs here...

// Now, the enum that holds them
enum PageComponentType: Codable {
    case titleSlide(TitleSlideContent)
    case boxes(BoxesContent)
    // Add other cases here...

    enum CodingKeys: String, CodingKey {
        case type, content
    }

    // Custom Decoder
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let type = try container.decode(String.self, forKey: .type)
        
        switch type {
        case "TitleSlide":
            let content = try container.decode(TitleSlideContent.self, forKey: .content)
            self = .titleSlide(content)
        case "Boxes":
            let content = try container.decode(BoxesContent.self, forKey: .content)
            self = .boxes(content)
        default:
            throw DecodingError.dataCorruptedError(forKey: .type, in: container, debugDescription: "Unknown component type: \(type)")
        }
    }

    // Custom Encoder
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        
        switch self {
        case .titleSlide(let content):
            try container.encode("TitleSlide", forKey: .type)
            try container.encode(content, forKey: .content)
        case .boxes(let content):
            try container.encode("Boxes", forKey: .type)
            try container.encode(content, forKey: .content)
        }
    }
}
